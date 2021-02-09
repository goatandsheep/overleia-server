const dynamoose = require('dynamoose');

const region = process.env.AWS_REGION || 'us-east-1';

dynamoose.aws.sdk.config.update({
  region,
});

if (['development', 'test'].includes(process.env.NODE_ENV)) {
  dynamoose.aws.ddb.local();
  dynamoose.logger.providers.set(console);
  console.log('Connected to DynamoDB localhost');
} else {
  console.log('Updated Dynamo Config');
}

const ElementResponse = require('./ElementResponse');
const InputSchema = require('./InputModel');
const OutputSchema = require('./OutputResponse');
const TemplateResponse = require('./TemplateResponse');

const ElementModel = dynamoose.model('Element', new dynamoose.Schema(ElementResponse));
const InputModel = dynamoose.model('Input', new dynamoose.Schema(InputSchema));
const OutputModel = dynamoose.model('Output', new dynamoose.Schema(OutputSchema));
const TemplateModel = dynamoose.model('Template', new dynamoose.Schema(TemplateResponse));

module.exports = {
  ElementModel,
  InputModel,
  OutputModel,
  TemplateModel,
};
