const pip = require('overleia');

// TODO: fetch from S3

const settings = {
  INPUT_DIRECTORY: '/data/',
};

const overleia = async function overleia(inputs, template) {
  // TODO: initially test with some sample data
  const pipParams = {
    inputs,
    template,
  };
  const results = await pip(pipParams, settings.INPUT_DIRECTORY);
  console.log('results', results);
  // TODO: set values in DynamoDB
  // TODO: upload to S3
};

module.exports = {
  overleia,
  settings,
};
