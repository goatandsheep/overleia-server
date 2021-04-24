import dynamoose from 'dynamoose';

import ElementResponse from './ElementResponse.js';
import InputSchema from './InputModel.js';
import OutputSchema from './OutputResponse.js';
import TemplateResponse from './TemplateResponse.js';

const region = process.env.AWS_REGION || 'us-east-1';

dynamoose.aws.sdk.config.update({
  region,
});

if (process.env.LOCAL_DYNAMODB !== 'false') {
  dynamoose.aws.ddb.local();
  dynamoose.logger.providers.set(console);
  console.log('Connected to DynamoDB localhost');
} else {
  console.log('Updated Dynamo Config');
}

const buildLocalDb = process.env.NODE_ENV === 'development' ? {} : { create: false };

export const ElementModel = dynamoose.model('Element', new dynamoose.Schema(ElementResponse), buildLocalDb);
export const InputModel = dynamoose.model('Input', new dynamoose.Schema(InputSchema), buildLocalDb);
export const OutputModel = dynamoose.model('Output', new dynamoose.Schema(OutputSchema), buildLocalDb);
export const TemplateModel = dynamoose.model('Template', new dynamoose.Schema(TemplateResponse), buildLocalDb);
