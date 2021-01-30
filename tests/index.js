const DynamoDbLocal = require('dynamodb-local');
const services = require('../src/services');

const dynamoLocalPort = 8000;

DynamoDbLocal.launch(dynamoLocalPort, null, ['-sharedDb']) // if you want to share with Javascript Shell
  .then(() => {
    // do your tests

    DynamoDbLocal.stop(dynamoLocalPort);
  });
