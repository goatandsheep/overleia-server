const pip = require('overleia');
const fs = require('fs').promises;
const AWS = require('aws-sdk');
const path = require('path');
const { OutputModel } = require('../models');

const s3 = new AWS.S3();
const fileBucket = process.env.S3_FILE_BUCKET;

const settings = {
  INPUT_DIRECTORY: '/data/',
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

const overleia = async function overleia(inputs, template, subfolder, job) {
  // TODO: initially test with some sample data
  const outputPath = path.join(__dirname, '..', '..', 'data', (job.name + '.mp4'));
  const pipParams = {
    output: outputPath,
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
    filePut(job.name + '.mp4', s3FolderPath, outputPath);
    console.log('success!');
  } catch (err) {
    await OutputModel.update({
      id: job.id,
    }, {
      status: 'Cancelled',
      updatedDate: new Date(),
      errorlog: err.message
    });
    console.error('error', err);
  }
};

module.exports = {
  overleia,
  settings,
};
