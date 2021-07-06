const DynamoDbLocal = require('dynamodb-local');
// const express = require('express');
const app = require('../src/app');
const { v4: uuidv4 } = require('uuid');
// const services = require('../src/services');
const {
   InputModel,
   OutputModel,
   TemplateModel,
 } = require('../src/models');
const dynamoLocalPort = 8000;

DynamoDbLocal.configureInstaller({
  installPath: './dynamodblocal-bin'
});

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
/*
DynamoDbLocal.launch(dynamoLocalPort, null, ['-sharedDb'])
  .then(async () => {
    console.log('running dynamo')
  }).catch((err) => {
    console.error(err)
  })
*/
const thisId = uuidv4();
const template1 = TemplateModel.create({
  id: thisId,
  height: 1080,
  name: 'template1',
  views: [{
    height: 80,
    width: 100,
    x: 15,
    y: 150
  }]
});

beforeAll(() => DynamoDbLocal.launch(dynamoLocalPort, null, ['-sharedDb']));

describe('my tests', () => {

    // setup the db
    // running dinomaurDB
   // DynamoDbLocal.launch(dynamoLocalPort, null, ['-sharedDb']),

    /*
    // creating files and 
    const in1 = await InputModel.create({ file: 'test1.mp4' });
    const in2 = await InputModel.create({ file: 'test2.mp4' });
    const in3 = await InputModel.create({ file: 'test3.mp4' });
    */
  
    /*
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
    */
    // TODO: rethink how tests are done. typically test suites are one of each and you do all the functions, but then you try with different test inputs. See testFunction
 // );
  
  // tests
  
  /*
  it('create input 1', () => {
    // TODO: abstract from app.js
    const inputProm = app.functions.createInput('the-ask.mp4', 'pee', 'us-east-1:4f9039ff-2a9e-49c0-8464-443f9a070f7f');
    return expect(inputProm).resolves.toBe(false);
  }, 9999999);
  */

  it('get template test', () => {
    const myProm = app.functions.getTemplate(template1.id);
    return expect(myProm).resolves.toBe(true);
  }, 9999999);

  /*
  it('list files test', () => {
    // TODO: abstract from app.js
    const files = InputModel.scan().exec();
    const fileProm = app.functions.listFiles(files);
    return expect(fileProm).resolves.toBe(false);
  }, 9999999);
  
  it('creating template', () => {
    // TODO: abstract from app.js
    const template = app.functions.createTemplate(id, req);
    const saveTemplate = app.functions.saveTemplate(template);
    return expect(saveTemplate).resolves.toBe(false);
  }, 9999999);

  it('creating outputs', () => {
    // TODO: abstract from app.js
    const output1 = app.functions.createJob({
      name: 'output1.mp4',
      inputs: [in1.id, in2.id, in3.id],
      templateId: template1.id,
    });
    const saveJob1 = app.functions.saveJob(output1);

    const output2 = app.functions.createJob({
      name: 'output1.mp4',
      inputs: [in2.id, in3.id, in1.id],
      templateId: template2.id,
    });
    const saveJob2 = app.functions.saveJob(output2);
    return expect(saveJob1).resolves.toBe(false) && expect(saveJob1).resolves.toBe(false);
  }, 9999999);

  it('searching outputs', () => {
    const outputs = app.function.listJobs(owner); 
    return expect(outputs).resolves.toBe(false);
  }, 9999999);
  */
  afterAll(async () => {
    // teardown db
    await DynamoDbLocal.stop(dynamoLocalPort);
    // end of teardown
  });
});
