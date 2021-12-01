const dynamoose = require('dynamoose');

const region = process.env.AWS_REGION || 'us-east-1';

if (process.env.LOCAL_DYNAMODB !== 'false') {
  dynamoose.aws.sdk.config.update({
    region: 'localhost',
  });
  dynamoose.aws.ddb.local();
  dynamoose.logger.providers.set(console);
  console.log('Connected to DynamoDB localhost');
} else {
  dynamoose.aws.sdk.config.update({
    region,
  });
  console.log('Updated Dynamo Config');
}

const InputSchema = require('./InputModel');
const OutputSchema = require('./OutputModel');
const TemplateResponse = require('./TemplateResponse');

const buildLocalDb = (typeof process.env.LOCAL_DYNAMODB !== 'undefined') && (process.env.LOCAL_DYNAMODB === 'true') ? { create: true, timestamps: true } : { timestamps: true };

const InputModel = dynamoose.model('Input', new dynamoose.Schema(InputSchema), buildLocalDb);
const OutputModel = dynamoose.model('Output', new dynamoose.Schema(OutputSchema), buildLocalDb);
const TemplateModel = dynamoose.model('Template', new dynamoose.Schema(TemplateResponse), buildLocalDb);

module.exports = {
  InputModel,
  OutputModel,
  TemplateModel,
};
