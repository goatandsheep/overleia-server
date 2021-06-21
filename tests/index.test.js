const DynamoDbLocal = require('dynamodb-local');
// const express = require('express');
const app = require('../src/app');
// const services = require('../src/services');
const {
  // ElementModel,
  InputModel,
  OutputModel,
  TemplateModel,
} = require('../src/models');
const dynamoLocalPort = 8000;

const testFunction = async (inputsObj, templateObj) => {
  // TODO: create input
  // TODO: get input
  // TODO: create template
  // const templateInst = blahblah(templateObj)
  // app.functions.getTemplate(templateInst.id)
  // TODO: search inputs
  // TODO: search templates
  // TODO: create output
  // TODO: search outputs
}

describe('my tests', () => {
  beforeAll(async () => {
    // setup the db
    // running dinomaurDB
    DynamoDbLocal.launch(dynamoLocalPort, null, ['-sharedDb']);
    // creating files and 
    const in1 = await InputModel.create({ file: 'test1.mp4' });
    const in2 = await InputModel.create({ file: 'test2.mp4' });
    const in3 = await InputModel.create({ file: 'test3.mp4' });

    // TODO: abstract 
    const template1 = await TemplateModel.create({
      height: 1080,
      name: 'template1',
      views: [{
        height: 80,
        width: 100,
        x: 15,
      }, {
        height: 80,
        width: 100,
        x: 150,
      }],
    });

    const template2 = await TemplateModel.create({
      height: 1080,
      name: 'template1',
      views: [{
        height: 1000,
        width: 100,
        x: 15,
      }, {
        height: 1000,
        width: 100,
        x: 150,
      }],
    });
    // TODO: rethink how tests are done. typically test suites are one of each and you do all the functions, but then you try with different test inputs. See testFunction
  });
  it('create input 1', () => {
    // TODO: abstract from app.js
  })
  it('get template test', () => {
    const myProm = app.functions.getTemplate('1231232');
    return expect(myProm).resolves.toBe(true);
  }, 9999999);
  it('searching for files', () => {
    // TODO: abstract from app.js
    const files = await InputModel.scan().exec();
    if (files.length) {
      console.log(files);
    } else {
      throw new Error('No files found');
    }
  }, 9999999);
  it('creating templates', () => {
    // TODO: abstract from app.js
    const templates = await TemplateModel.scan().exec();
    if (templates.length) {
      console.log(templates);
    } else {
      throw new Error('No templates found');
    }
  }, 9999999);
  it('creating outputs', () => {
    // TODO: abstract from app.js

    const output1 = await OutputModel.create({
      name: 'output1.mp4',
      inputs: [in1.id, in2.id, in3.id],
      templateId: template1.id,
    });

    const output2 = await OutputModel.create({
      name: 'output1.mp4',
      inputs: [in2.id, in3.id, in1.id],
      templateId: template2.id,
    });
  }, 9999999);
  it('searching outputs', () => {
    const outputs = await OutputModel.scan().exec();
    if (outputs.length) {
      console.log(outputs);
    } else {
      throw new Error('No outputs found');
    }
  })
  afterAll(async () => {
    // teardown db
    DynamoDbLocal.stop(dynamoLocalPort);
    // end of teardown
  });
});
