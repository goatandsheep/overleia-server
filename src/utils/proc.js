const pip = require('overleia');
const AWS = require('aws-sdk');
const fs = require('fs').promises;
const pathf = require('path');
const { OutputModel } = require('../models');

const s3 = new AWS.S3();
const fileBucket = process.env.S3_FILE_BUCKET;

const settings = {
  INPUT_DIRECTORY: '/data/',
};

const absPathDir = pathf.join(__dirname, '..', '..', settings.INPUT_DIRECTORY);

const fileFetch = async function fileFetch(filename, folder) {
  // TODO: get proper key
  const fullPath = absPathDir + filename;
  const params = {
    Bucket: fileBucket,
    Key: folder + filename,
  };
  const fileBin = await s3.getObject(params).promise();
  console.log('fullpath', fullPath);
  return fs.writeFile(fullPath, fileBin);
};

const filePut = async function filePut(filename, folder) {
  const fullPath = absPathDir + filename;
  const data = await fs.readFile(fullPath);
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

const overleia = async function overleia(inputs, template, subfolder, outputId) {
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
    await Promise.all(fileConfirms);
    const results = await pip(pipParams, absPathDir);
    console.log('results', results);
    if (!results) {
      throw new Error('processing error');
    }
    await OutputModel.update({
      id: outputId,
    }, {
      status: 'Complete',
      updatedDate: new Date(),
    });
    // TODO: rename output file
    filePut('completed.mp4', s3FolderPath);
  } catch (err) {
    await OutputModel.update({
      id: outputId,
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
