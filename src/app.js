const express = require('express');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
require('dotenv-extended').load();

const app = express();

const {
  ElementModel,
  InputModel,
  OutputModel,
  TemplateModel,
} = require('./models');

/**
 * Checks user groups
 */
function verifyToken() {
  return true;
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let proc = undefined;
if (typeof process.env.PROC_SERVER !== 'undefined' && process.env.PROC_SERVER !== 'false') {
  proc = require('./utils/proc');
}

let corsSettings = {
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
};
corsSettings = Object.assign(corsSettings, process.env.NODE_ENV === 'development' ? {} : {
  origin: process.env.SERVER_URL,
});
app.use(cors(corsSettings));
app.options('*', cors());

if (typeof process.env.COGNITO_POOL_ID !== 'undefined' && process.env.COGNITO_POOL_ID !== 'false') {
  const authenticate = require('./middleware/authMiddleware');
  app.use(authenticate);
}

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
    const jobOut = { id, ...req.body };
    const job = await OutputModel.create(jobOut);
    await job.save();

    const inputs = await Promise.all(req.body.inputs.map(
      async (inputId) => InputModel.get({ id: inputId })
    ));
    const template = await TemplateModel.get({ id: req.body.templateId });
    // if (typeof proc !== 'undefined' && job.type === 'Overleia') {
    proc.overleia(inputs, template, req.user.identityId);
    // }
    // else if (typeof proc !== 'undefined' && job.type === 'BeatCaps') {
    //   proc.beatcaps();
    // }
    res.status(200).jsonp(jobOut);
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
    let jobs = [];
    if (req.query.status) {
      // TODO: sort by status
      jobs = await OutputModel.scan().using('statusIndex').exec();
    } else {
      jobs = await OutputModel.scan().exec();
    }
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

    const templateId = req.params.id;
    await TemplateModel.update({ id: templateId }, req.body);
    const template = await TemplateModel.get({ id: templateId });
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
    console.log('body', req.body);
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

app.all('/*', (req, res) => {
  console.log('404', req);
  res.status(404).send('Route not found');
});

module.exports = app;
