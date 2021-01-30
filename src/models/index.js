const dynamoose = require('dynamoose');

const Element = require('./Element');
const ElementResponse = require('./ElementResponse');

const OutputSchema = require('./OutputResponse');
const OutputResponse = require('./OutputResponse');
const Template = require('./Template');
const TemplateResponse = require('./TemplateResponse');
const View = require('./View');

const ElementModel = dynamoose.model('Element', new dynamoose.Schema(Element));
const OutputModel = dynamoose.model('Output', new dynamoose.Schema(OutputSchema));
const TemplateModel = dynamoose.model('Template', new dynamoose.Schema(Template));

module.exports = {
  ElementModel,
  OutputModel,
  TemplateModel,
};
