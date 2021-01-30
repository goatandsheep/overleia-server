const dynamoose = require('dynamoose');

const Element = require('./Element.json');
const ElementResponse = require('./ElementResponse.json');

const OutputSchema = require('./OutputResponse.json');
const OutputResponse = require('./OutputResponse.json');
const Template = require('./Template.json');
const TemplateResponse = require('./TemplateResponse.json');
const View = require('./View.json');

const ElementModel = dynamoose.model('Element', new dynamoose.Schema(Element));
const OutputModel = dynamoose.model('Output', new dynamoose.Schema(OutputSchema));
const TemplateModel = dynamoose.model('Template', new dynamoose.Schema(Template));

module.exports = {
  ElementModel,
  OutputModel,
  TemplateModel,
};
