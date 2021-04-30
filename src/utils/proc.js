const pip = require('overleia');
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const fs = require('fs').promises;
const pathf = require('path');

// TODO: fetch from S3

const fileBucket = process.env.S3_FILE_BUCKET;

const settings = {
  INPUT_DIRECTORY: '/data/',
};

const absPathDir = pathf.join(__dirname, '..', '..', settings.INPUT_DIRECTORY);

const fileFetch = async function fileFetch(filename, folder) {
  // TODO: get proper key
  const params = {
    Bucket: fileBucket,
    Key: folder + filename,
  };
  const fileBin = await s3.getObject(params).promise();
  const fullPath = absPathDir + filename;
  await fs.writeFile(fullPath, fileBin);
  return fullPath;
};

const overleia = async function overleia(inputs, template, subfolder) {
  // TODO: initially test with some sample data
  const pipParams = {
    inputs,
    template,
  };
  console.log('inputs', inputs);
  const fileConfirms = [];
  for (let i = 0, len = inputs.length; i < len; i += 1) {
    fileConfirms.push(fileFetch(inputs[i].file, 'private/' + subfolder + '/'));
  }
  await Promise.all(fileConfirms);
  const results = await pip(pipParams, '/../..' + settings.INPUT_DIRECTORY);
  console.log('results', results);
  // TODO: set values in DynamoDB
  // TODO: upload to S3
  // TODO: file cleanup
};

module.exports = {
  overleia,
  settings,
};
