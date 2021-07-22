const fs = require('fs').promises;
const AWS = require('aws-sdk');
const path = require('path');
const pip = require('overleia');
const ffprobePath = require('@ffprobe-installer/ffprobe').path;
const ffmpeg = require('fluent-ffmpeg');
const {
  DEFAULT_META,
  DEFAULT_VALIDITY,
  INPUT_DIRECTORY,
  INPUT_MP3_DIR,
  NPUT_MP3_FILENAME,
  INPUT_MP4_FILENAME,
  INPUT_MP4_PATH,
  TEST_MP3_PATH,
} = require('./constants');
const { mp4ToMemfs, memfsToMp3 } = require('./Mp4ToMp3Utils');
const { mp3ToData } = require('./Mp3ToJsonUtils');
const { buildNodeWebvttCues, buildNodeWebvttInput, buildWebvtt } = require('./JsonToWebvttUtils');
const { OutputModel, InputModel } = require('../models');

ffmpeg.setFfprobePath(ffprobePath);

const s3 = new AWS.S3();
const fileBucket = process.env.S3_FILE_BUCKET;

const storageDelete = async function storageDelete(filename, folder) {
  const params = {
    Bucket: fileBucket,
    Key: folder + filename,
  };
  try {
    s3.deleteObject(params, (err, data) => {
      if (err) {
        console.log(err, err.stack);
      }
    });
    // TODO: update Stripe storage usage
  } catch (err) {
    console.error(`Error deleting file from S3: ${err}`);
  }
};

const fileDelete = async function fileDelete(filename) {
  try {
    const pathString = path.join(__dirname, '..', '..', 'data', filename);
    await fs.unlink(pathString);
    return pathString;
  } catch (err) {
    console.error('file delete error', err);
    throw err;
  }
};

/**
 * @param {Number} time seconds - does this need to be estimated too?
 * @param {Number} resolution height * width of output
 */
const storageEstimate = async function storageEstimate(time, resolution) {
  /*
  const totalDurationCalculate = async function (inputs, metadata) {
    if (inputs.length !== metadata.length) {
      throw new Error('mismatched template and input lengths');
    }

    const lengthProms = inputs.map((entry, i) => {
      return (entry.delay || 0) + metadata[i].duration;
    });
    const lengths = await Promise.all(lengthProms);
    return Math.max(...lengths, 1);
  };
  */
  const compressionRatio = 0.65;
  return time * resolution * compressionRatio;
};

// download
const fileFetch = async function fileFetch(filename, folder) {
  try {
    const params = {
      Bucket: fileBucket,
      Key: folder + filename,
    };
    const fileBin = await s3.getObject(params).promise();
    const pathFolder = path.join(__dirname, '..', '..', 'data');
    const pathString = path.join(pathFolder, filename);
    try {
      await (await fs.stat(pathFolder)).isDirectory();
    } catch {
      await fs.mkdir(pathFolder);
    }
    await fs.writeFile(pathString, fileBin.Body);
    return pathString;
  } catch (err) {
    console.error('file fetch error', err);
    console.log('path', folder + filename);
    throw err;
  }
};

/**
 * get file size
 */
const sizeOf = async function sizeOf(filename, folder) {
  const params = {
    Key: folder + filename,
    Bucket: fileBucket,
  };
  const head = await s3.headObject(params).promise();
  // TODO: update Stripe storage usage
  return head.ContentLength;
};

// upload
const filePut = async function filePut(filename, folder, localFilePath) {
  const data = Buffer.from(await fs.readFile(localFilePath), 'binary');
  const params = {
    Body: data,
    Bucket: fileBucket,
    Key: folder + filename,
  };
  await s3.putObject(params).promise();
  // TODO: does this work?
  const fileSize = await sizeOf(filename, folder);
  return fileSize;
};

const beatcaps = async function beatcaps(input, subfolder, job) {
  try {
    const inputNameSegs = input.file.split('.');
    inputNameSegs.pop();
    const inputName = inputNameSegs.join('.');
    const outputFile = `${inputName}.vtt`;
    const outputPath = path.join(__dirname, '..', '..', 'data', (outputFile));
    if (!input.size || input.size > 0) {
      const inputSize = await sizeOf(input.file, subfolder);
      input.size = inputSize;
      // TODO: update Stripe storage usage
    }

    const s3FolderPath = `private/${subfolder}/`;

    let fileData;
    let inputVideo = true;
    const mp3InPath = path.join(__dirname, '..', '..', 'data', `${inputName}.mp3`);
    try {
      // 1) use the mp4tomp3 module
      const filePath = await fileFetch(`${inputName}.mp4`, s3FolderPath);
      fileData = await fs.readFile(filePath);
      await memfsToMp3(mp3InPath, mp4ToMemfs(fileData));
    } catch {
      inputVideo = false;
      const filePath = await fileFetch(`${inputName}.mp3`, s3FolderPath);
      fileData = await fs.readFile(filePath);
    }

    // 2) use the mp3tojson module
    const beats = await mp3ToData(mp3InPath, 0.3);
    // 3) use the jsontowebvtt module
    const cues = buildNodeWebvttCues(beats);
    const vttInput = buildNodeWebvttInput(DEFAULT_META, cues, DEFAULT_VALIDITY);
    const vttOutput = buildWebvtt(vttInput);
    await fs.writeFile(outputPath, vttOutput);
    await filePut(outputFile, s3FolderPath, outputPath);
    // const size = await sizeOf(inputName + '.mp4', `private/${subfolder}/`);
    await OutputModel.update({
      id: job.id,
    }, {
      status: 'Complete',
      type: 'BeatCaps',
      updatedDate: new Date(),
      size: input.size,
    });

    const deleteProms = [];
    deleteProms.push(fileDelete(`${inputName}.vtt`));
    deleteProms.push(fileDelete(`${inputName}.mp3`));
    if (inputVideo) {
      deleteProms.push(fileDelete(`${inputName}.mp4`));
    }
    await Promise.all(deleteProms);
    console.log('success!');
  } catch (err) {
    console.error('processing error', err);
    await OutputModel.update({
      id: job.id,
    }, {
      status: 'Cancelled',
      updatedDate: new Date(),
      errorlog: err.message,
    });
  }
};

const overleia = async function overleia(inputs, template, subfolder, job) {
  // TODO: initially test with some sample data
  const outputPath = path.join(__dirname, '..', '..', 'data', (`${job.name}.mp4`));
  const pipParams = {
    output: outputPath,
    inputs,
    template,
    verbose: true,
  };
  console.log('template', template);
  const s3FolderPath = `private/${subfolder}/`;
  try {
    const fileConfirms = [];
    for (let i = 0, len = inputs.length; i < len; i += 1) {
      fileConfirms.push(fileFetch(inputs[i].file, s3FolderPath));
    }
    pipParams.inputs = await Promise.all(fileConfirms);

    const updateProgress = async function updateProgress(percentage) {
      await OutputModel.update({
        id: job.id,
      }, {
        progress: percentage,
        status: 'In Progress',
        updatedDate: new Date(),
      });
    };
    pipParams.progressCallback = updateProgress;
    const results = await pip(pipParams);
    if (!results) {
      throw new Error('processing error');
    }
    const jobPath = `${job.name}.mp4`;
    const size = await filePut(jobPath, s3FolderPath, outputPath);
    // const size = await sizeOf(`${job.name}.mp4`, `private/${subfolder}/`);
    // TODO: update Stripe storage usage
    await OutputModel.update({
      id: job.id,
    }, {
      status: 'Complete',
      updatedDate: new Date(),
      size,
    });
    const deleteProms = [];
    deleteProms.push(fileDelete(jobPath));
    for (let i = 0, len = inputs.length; i < len; i += 1) {
      deleteProms.push(fileDelete(inputs[i].file));
    }
    await Promise.all(deleteProms);
    console.log('success!');
  } catch (err) {
    await OutputModel.update({
      id: job.id,
    }, {
      status: 'Cancelled',
      updatedDate: new Date(),
      errorlog: err.message,
    });
    console.error('error', err);
  }
};

// TODO: fix
const mediaLength = async (filename, folder) => {
  // TODO: fetch
  const fileBin = await fileFetch(filename, folder);
  const prom = new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filename, (err, metadata) => {
      if (err) {
        console.error('error');
        reject(err);
      } else {
        resolve(metadata.format.duration);
      }
    });
  });
  return prom;
};

module.exports = {
  mediaLength,
  overleia,
  beatcaps,
  sizeOf,
  storageDelete,
};
