const dynamoose = require('dynamoose');
const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
const region = 'us-east-1';

const bodyParser = require('body-parser');
// const services = require('./services');
const {
  ElementModel,
  InputModel,
  OutputModel,
  TemplateModel,
} = require('./models');

// const jsonServer = require('json-server')

dynamoose.aws.sdk.config.update({
  region,
});
if (['development', 'test'].includes(process.env.NODE_ENV)) {
  dynamoose.aws.ddb.local();
  console.log('Connected to DynamoDB localhost');
} else {
  console.log('Updated Dynamo Config');
}
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/**
 * Checks user groups
 */
function verifyToken() {
  return true;
}

app.use((req, res, next) => {
  res.header('Allow');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Request-Headers', 'Origin, Content-Type, X-Auth-Token, Authorization, Set-Cookie');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Request-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Content-Type', 'application/javascript');
  next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.options('/*', (req, res) => {
  res.status(200).jsonp({});
});

// app.use(/^(?!\/auth).*$/, (req, res, next) => {
app.use(/^(?!\/login).*$/, (req, res, next) => {
  // if (req.headers.authorization === undefined || req.headers.authorization.split(' ')[0] !== 'Bearer') {
  //   const status = 401;
  //   const message = 'Bad authorization header';
  //   console.log(req.headers.authorization);
  //   res.status(status).json({ status, message });
  //   return;
  // }
  // try {
  //   verifyToken(req.headers.authorization.split(' ')[1]);
  //   next();
  // } catch (err) {
  //   const status = 401;
  //   const message = 'Error: access_token is not valid';
  //   res.status(status).json({ status, message });
  // }
  // TODO: get user object and return
  verifyToken();
  next();
});

/**
 * get info about a single job
 */
app.get('/jobs/:uuid', async (req, res) => {
  try {
    const job = await OutputModel.get({ uuid: req.params.uuid });
    res.status(200).jsonp(job);
  } catch (err) {
    console.error('get/jobs/uuid', err);
    res.status(500).send('Bad Request');
  }
});

/**
 * create job / apply template to file
 */
app.post('/jobs', async (req, res) => {
  const uuid = uuidv4();
  const job = new OutputModel({ ...req.body, uuid });
  try {
    await job.save();
    res.status(200).jsonp(job);
  } catch (err) {
    console.error('post/jobs', err);
    res.status(500).send('Bad Request');
  }
});

/**
 * get jobs / outputs list
 */
app.get('/jobs', async (req, res) => {
  try {
    const jobs = await OutputModel.scan().all();
    res.status(200).jsonp(jobs);
  } catch (err) {
    console.error('get/jobs', err);
    res.status(500).send('Bad Request');
  }
});

/**
 * create new template
 */
app.post('/templates/new', async (req, res) => {
  const uuid = uuidv4();
  const template = new TemplateModel({ ...req.body, uuid });
  try {
    await template.save();
    res.status(200).jsonp(template);
  } catch (err) {
    console.error('post/templates/new', err);
    res.status(500).send('Bad Request');
  }
});

/**
 * get template
 */
app.get('/templates/:uuid', (req, res) => {
  try {
    const template = TemplateModel.get({ uuid: req.params.uuid });
    res.status(200).jsonp(template);
  } catch (err) {
    console.error('get/templates/uuid', err);
    res.status(500).send('Bad Request');
  }
});

/**
 * update template
 */
app.patch('/templates/:uuid', async (req, res) => {
  try {
    let template = TemplateModel.get({ uuid: req.params.uuid });
    template = Object.assign(template, req);
    await template.save();
    res.status(200).jsonp(template);
  } catch (err) {
    console.error('patch/templates/uuid', err);
    res.status(500).send('Bad Request');
  }
});

/**
 * list templates
 */
app.get('/templates', async (req, res) => {
  try {
    const templates = await TemplateModel({ uuid: req.params.uuid });
    res.status(200).jsonp(templates);
  } catch (err) {
    console.error('get/templates', err);
    res.status(500).send('Bad Request');
  }
});

/**
 * list uploaded files
 */
app.get('/file/list', async (req, res) => {
  try {
    const files = await InputModel.scan().exec();
    if (files.length) {
      res.status(200).jsonp(files);
    } else {
      res.status(400).send('No files found');
    }
  } catch (err) {
    console.error('get/file/list', err);
    res.status(500).send('Bad Request');
  }
});

/**
 * get template
 */
app.get('/file/:uuid', async (req, res) => {
  try {
    const file = InputModel.get({ uuid: req.params.uuid });
    res.status(200).jsonp(file);
  } catch (err) {
    console.error('get/file/uuid', err);
    res.status(500).send('Bad Request');
  }
});

/**
 * upload file
 */
app.post('/file', async (req, res) => {
  try {
    const uuid = uuidv4();
    const file = new InputModel({ file: req.body.file, uuid });
    await file.save();
    res.status(200).jsonp(file);
  } catch (err) {
    console.error('post/file', err);
    res.status(500).send('Bad Request');
  }
});

/**
 * get a element
 */
app.get('/element/:uuid', async (req, res) => {
  try {
    const element = await ElementModel.get({ uuid: req.params.uuid });
    res.status(200).jsonp(element);
  } catch (err) {
    console.error('get/element', err);
    res.status(500).send('Bad Request');
  }
});

// keep at the bottom

app.get('/*', (req, res) => {
  res.status(404).send('Route not found');
});

module.exports = app;
