const pip = require('overleia');
const { mp4ToMemfs, memfsToMp3 } = require('./Mp4ToMp3Utils');
const { mp3ToData } = require('./Mp3ToJsonUtils');
const { buildNodeWebvttCues, buildNodeWebvttInput, buildWebvtt } = require('./JsonToWebvttUtils');
const {
  DEFAULT_META,
  DEFAULT_VALIDITY,
  INPUT_MP3_DIR, INPUT_MP3_FILENAME, INPUT_MP4_FILENAME, INPUT_MP4_PATH, TEST_MP3_PATH,
} = require('./constants');
const fs = require('fs').promises;
const AWS = require('aws-sdk');
const path = require('path');
const { OutputModel } = require('../models');

const s3 = new AWS.S3();
const fileBucket = process.env.S3_FILE_BUCKET;

const settings = {
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

const fileFetch = async function fileFetch(filename, folder) {
  try {
    const params = {
      Bucket: fileBucket,
      Key: folder + filename,
    };
    const fileBin = await s3.getObject(params).promise();
    const pathString = path.join(__dirname, '..', '..', 'data', filename);
    await fs.writeFile(pathString, fileBin.Body);
    return pathString;
  } catch (err) {
    console.error('file fetch error', err);
    console.log('path', folder + filename);
    throw err;
  }
};

const filePut = async function filePut(filename, folder, localFilePath) {
  const data = Buffer.from(await fs.readFile(localFilePath), 'binary');
  const params = {
    Body: data,
    Bucket: fileBucket,
    Key: folder + filename,
  };
  return s3.putObject(params).promise();
};

const beatcaps = async function beatcaps(input, subfolder) {
  try {
    // const outputPath = path.join(__dirname, '..', '..', 'data', (`${input.name}.mp4`));

    const s3FolderPath = `private/${subfolder}/`;

    const fileConfirms = [];
    fileConfirms.push(fileFetch(input, s3FolderPath));
    // 1) use the mp4tomp3 module
    // if (inputFile.endsWith('.mp4')) {

    memfsToMp3(mp4ToMemfs(INPUT_MP4_FILENAME, constants.INPUT_DIRECTORY, INPUT_MP3_FILENAME));

    // 2) use the mp3tojson module
    const beats = await mp3ToData(INPUT_MP3_DIR + INPUT_MP3_FILENAME, 0.3);
    // 3) use the jsontowebvtt module
    const cues = buildNodeWebvttCues(beats);
    const vttInput = buildNodeWebvttInput(DEFAULT_META, cues, DEFAULT_VALIDITY);
    buildWebvtt(vttInput);
  } catch (err) {
    console.error(err);
  }
};

/**
 * get file size
 */
 function sizeOf(key) {
  return s3.headObject({ Key: folder + filename, Bucket: fileBucket})
      .promise()
      .then(res => res.ContentLength);
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
      fileConfirms.push(fileFetch(inputs[i], s3FolderPath));
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
    await OutputModel.update({
      id: job.id,
    }, {
      status: 'Complete',
      updatedDate: new Date(),
    });
    // TODO: rename output file
    const jobPath = `${job.name}.mp4`;
    await filePut(jobPath, s3FolderPath, outputPath);
    const deleteProms = [];
    deleteProms.push(fileDelete(jobPath));
    for (let i = 0, len = inputs.length; i < len; i += 1) {
      deleteProms.push(fileDelete(inputs[i]));
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

module.exports = {
  overleia,
  beatcaps,
  settings,
  sizeOf,
};
