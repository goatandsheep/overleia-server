const DynamoDbLocal = require('dynamodb-local');
// const services = require('../src/services');

const {
  // ElementModel,
  InputModel,
  OutputModel,
  TemplateModel,
} = require('../src/models');

const dynamoLocalPort = 8000;

DynamoDbLocal.launch(dynamoLocalPort, null, ['-sharedDb']) // if you want to share with Javascript Shell
  .then(async () => {
    console.log('running dinomaurDB');
  }).catch((err) => {
    console.log('error', err);
  });

/*
    // do your tests
    console.log('running dinomaurDB');
    console.log('creating files');
    const in1 = await InputModel.create({ file: 'test1.mp4' });
    const in2 = await InputModel.create({ file: 'test2.mp4' });
    const in3 = await InputModel.create({ file: 'test3.mp4' });
    console.log('searching for files');
    const files = await InputModel.scan().exec();
    if (files.length) {
      console.log(files);
    } else {
      throw new Error('No files found');
    }

    console.log('creating templates');

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

    const templates = await TemplateModel.scan().exec();
    if (templates.length) {
      console.log(templates);
    } else {
      throw new Error('No templates found');
    }

    console.log('creating outputs');

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

    const outputs = await OutputModel.scan().exec();
    if (outputs.length) {
      console.log(outputs);
    } else {
      throw new Error('No outputs found');
    }
  }).catch((err) => {
    console.error(err);
    DynamoDbLocal.stop(dynamoLocalPort);
  });

  */
