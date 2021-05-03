const pip = require('overleia');
const AWS = require('aws-sdk');
const fs = require('fs').promises;
const pathf = require('path');
const { OutputModel } = require('../models');
const { file } = require('../models/InputModel');

const s3 = new AWS.S3();
const fileBucket = process.env.S3_FILE_BUCKET;

const settings = {
  INPUT_DIRECTORY: '/data/',
};

const absPathDir = pathf.join(__dirname, '..', '..', settings.INPUT_DIRECTORY);

const fileFetch = async function fileFetch(filename, folder) {
  const params = {
    Bucket: fileBucket,
    Key: folder + filename,
  };
  const fileBin = await s3.getObject(params).promise();
  return fileBin.Body;
};

const filePut = async function filePut(filename, folder, data) {
  const params = {
    Body: data,
    Bucket: fileBucket,
    Key: folder + filename,
  };
  return s3.putObject(params).promise();
};

const clearGarbage = async function clearGarbage(filename) {
  const fullPath = absPathDir + filename;
  return fs.unlink(fullPath);
};

const overleia = async function overleia(inputs, template, subfolder, job) {
  // TODO: initially test with some sample data
  const pipParams = {
    inputs,
    template,
    verbose: true,
  };
  console.log('template', template);
  const s3FolderPath = 'private/' + subfolder + '/';
  try {
    const fileConfirms = [];
    for (let i = 0, len = inputs.length; i < len; i += 1) {
      fileConfirms.push(fileFetch(inputs[i], s3FolderPath));
    }
    pipParams.inputs = await Promise.all(fileConfirms);
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
    filePut(job.name + '.mp4', s3FolderPath, Buffer.from(results));
  } catch (err) {
    await OutputModel.update({
      id: job.id,
    }, {
      status: 'Cancelled',
      updatedDate: new Date(),
    });
    console.error('error', err);
  }
  // const garbageConfirms = [];
  // for (let i = 0, len = inputs.length; i < len; i += 1) {
  //   garbageConfirms.push(clearGarbage(inputs[i], s3FolderPath));
  // }
  // Promise.all(garbageConfirms);
  // clearGarbage('completed.mp4');
};

module.exports = {
  overleia,
  settings,
};
