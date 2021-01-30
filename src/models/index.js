const dynamoose = require('dynamoose');

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
