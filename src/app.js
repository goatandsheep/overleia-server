// const dynamoose = require('dynamoose');
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

const app = express();

// const services = require('./services');
const {
  ElementModel,
  InputModel,
  OutputModel,
  TemplateModel,
} = require('./models');

// const jsonServer = require('json-server')
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors);

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

// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

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
app.get('/jobs/:id', async (req, res) => {
  try {
    const job = await OutputModel.get({ id: req.params.id });
    res.status(200).jsonp(job);
  } catch (err) {
    console.error('get/jobs/id', err);
    res.status(500).send('Bad Request');
  }
});

/**
 * create job / apply template to file
 */
app.post('/jobs', async (req, res) => {
  const id = uuidv4();
  try {
    const job = await OutputModel.create({ id, ...req.body });
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
    const jobs = await OutputModel.scan().exec();
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
  const id = uuidv4();
  try {
    const template = await TemplateModel.create({ id, ...req.body });
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
app.get('/templates/:id', async (req, res) => {
  try {
    const template = await TemplateModel.get({ id: req.params.id });
    res.status(200).jsonp(template);
  } catch (err) {
    console.error('get/templates/id', err);
    res.status(500).send('Bad Request');
  }
});

/**
 * update template
 */
app.patch('/templates/:id', async (req, res) => {
  try {
    let template = await TemplateModel.get({ id: req.params.id });
    template = Object.assign(template, req);
    await template.save();
    res.status(200).jsonp(template);
  } catch (err) {
    console.error('patch/templates/id', err);
    res.status(500).send('Bad Request');
  }
});

/**
 * list templates
 */
app.get('/templates', async (req, res) => {
  try {
    const templates = await TemplateModel.scan().exec();
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
app.get('/file/:id', async (req, res) => {
  try {
    const file = await InputModel.get({ id: req.params.id });
    res.status(200).jsonp(file);
  } catch (err) {
    console.error('get/file/id', err);
    res.status(500).send('Bad Request');
  }
});

/**
 * upload file
 */
app.post('/file', async (req, res) => {
  try {
    const id = req.body.id || uuidv4();
    const file = await InputModel.create({ file: req.body.file, id });
    res.status(200).jsonp(file);
  } catch (err) {
    console.error('post/file', err);
    res.status(500).send('Bad Request');
  }
});

/**
 * get a element
 */
app.get('/element/:id', async (req, res) => {
  try {
    const element = await ElementModel.get({ id: req.params.id });
    res.status(200).jsonp(element);
  } catch (err) {
    console.error('get/element', err);
    res.status(500).send('Bad Request');
  }
});

// keep at the bottom

app.get('/*', (req, res) => {
  console.log('404', req);
  res.status(404).send('Route not found');
});

module.exports = app;
