const pip = require('overleia');
const beatcaps = require('beatcaps-library');
const fs = require('fs').promises;
const AWS = require('aws-sdk');
const path = require('path');
const { OutputModel } = require('../models');

const s3 = new AWS.S3();
const fileBucket = process.env.S3_FILE_BUCKET;

const settings = {
  INPUT_DIRECTORY: '/data/',
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

const bcaps = async function bcaps(inputFile) {
  

}

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
};
