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

  // list the files
  it('list files test', async () => {
    const listProm = await app.functions.listFiles(in1.owner);
    return expect(JSON.stringify(listProm)).toEqual(JSON.stringify([{owner: in1.owner, file: in1.file, id: inputId, status: 'In Progress'}]));
  }, 9999999);

  // declare output object
  const outputId = uuidv4();
  const out1 = {
    name: 'test1', 
    progress: 1,
    creationDate: 'today',
    inputs: 'abc',
    status: 'In Progress',
    type: 'Overleia', 
    updatedDate: 'today',
    owner: 'def',
  };

  // create the output 
  it('creating output test', async () => {
    const outputProm = await app.functions.createJob({outputId, ...out1, owner: out1.owner});
    return expect(JSON.stringify(outputProm)).toEqual(JSON.stringify({file: in1.file, id: outputId, owner: in1.owner, status: 'In Progress'}));
  }, 9999999);
  
  // TODO: rethink how tests are done. typically test suites are one of each and you do all the functions, but then you try with different test inputs. See testFunction

  /*

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
