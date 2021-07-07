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

beforeAll(() => DynamoDbLocal.launch(dynamoLocalPort, null, ['-sharedDb']));

describe('my tests', async () => {
  // setup the db
  // running dinomaurDB
  // DynamoDbLocal.launch(dynamoLocalPort, null, ['-sharedDb']),

  // declare template object 
  const template1Id = uuidv4();
  const template1 = {
    height: 1080,
    name: 'template1',
    views: [{
      height: 80,
      width: 100,
      x: 15,
      y: 150,
    }, {
      height: 1000,
      width: 100,
      x: 150,
      y: 0,
    }],
  };

  // create the template 
  it('create template 1', () => {
    const inputProm = app.functions.createTemplate(template1Id, template1);
    // TemplateModel.populate()
    return expect(inputProm).resolves.toEqual({ id: template1Id, ...template1 });
  }, 9999999);

  // get the template
  it('get template test', () => {
    const myProm = app.functions.getTemplate(template1Id);
    return expect(myProm).resolves.toEqual({ id: template1Id, ...template1 });
  }, 9999999);
  
  // declare input object
  const inputId = uuidv4(); 
  const in1 = {
    file: 'abc', 
    owner: 'def',
    status: 'In Progress',
  };

  // create the input 
  it('create input 1', () => {
    const inputProm = app.functions.createInput(in1.file, inputId, in1.owner);
    return expect(inputProm).resolves.toEqual({file: in1.file, id: inputId, owner: in1.owner, status: 'In Progress'});
  }, 9999999);
  

  // TODO: rethink how tests are done. typically test suites are one of each and you do all the functions, but then you try with different test inputs. See testFunction
  // );
  /*
  it('list files test', () => {
    // TODO: abstract from app.js
    const files = InputModel.scan().exec();
    const fileProm = app.functions.listFiles(files);
    return expect(fileProm).resolves.toBe(false);
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
