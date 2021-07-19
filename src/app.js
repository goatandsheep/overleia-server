const express = require('express');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
require('dotenv-flow').config();

const app = express();

const {
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

let proc;
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

if (typeof process.env.COGNITO_POOL_ID !== 'undefined' && process.env.COGNITO_POOL_ID && process.env.COGNITO_POOL_ID !== 'false') {
  const authenticate = require('./middleware/authMiddleware');
  app.use(authenticate);
}

app.functions = {};

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

app.delete('/jobs/:id', async (req, res) => {
  try {
    const job = await OutputModel.get({ id: req.params.id });
    await proc.storageDelete(job.file, `private/${req.user.identityId}/`);
    OutputModel.delete();
    res.status(200).jsonp(job);
  } catch (err) {
    console.error('delete/jobs/id', err);
    res.status(500).send('Bad Request Delete job');
  }
});

// ABSTRACTION: createJob
const createJob = async function createJob(job) {
  return OutputModel.create(job);
};

// ABSTRACTION: createJob
const saveJob = async function saveJob(job) {
  return job.save();
};

/**
 * create job / apply template to file
 */
app.post('/jobs', async (req, res) => {
  const id = uuidv4();
  try {
    const jobOut = { id, ...req.body, owner: req.user.identityId };
    const job = await createJob(jobOut);
    await saveJob(job);

    const inputs = await Promise.all(req.body.inputs.map(
      async (inputId) => (await InputModel.get({ id: inputId })),
    ));
    if (typeof proc !== 'undefined' && job.type === 'Overleia') {
      const template = await TemplateModel.get({ id: req.body.templateId });
      proc.overleia(inputs, template, req.user.identityId, job);
    } else if (typeof proc !== 'undefined' && job.type === 'BeatCaps') {
      proc.beatcaps(inputs[0], req.user.identityId, job);
    }
    res.status(200).jsonp(jobOut);
  } catch (err) {
    console.error('post/jobs', err);
    res.status(500).send('Bad Request');
  }
});

// ABSTRACTION: listJobs
const listJobs = async function listJobs(owner) {
  const jobs = await OutputModel.scan().filter('owner').eq(owner).exec();
  return jobs.map((job) => job.toJSON());
};

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
      jobs = await listJobs(req.user.identityId);
    }
    const out = {
      elements: jobs,
      total: jobs.count,
    };
    res.status(200).jsonp(out);
  } catch (err) {
    console.error('get/jobs', err);
    res.status(500).send('Bad Request');
  }
});

/**
 * ABSTRACTION: create template
 * @param {String} id
 * @param {Object} templateData
 * @returns {Promise<Template>}
 */
const createTemplate = async function createTemplate(id, templateData) {
  const template = TemplateModel.create({ id, ...templateData });
  return template;
};

// ABSTRACTION: save template
const saveTemplate = async function saveTemplate(template) {
  return template.save();
};

/**
 * create new template
 */
app.post('/templates/new', async (req, res) => {
  const id = uuidv4();
  try {
    const template = await createTemplate(id, ...req.body);
    await saveTemplate(template);
    res.status(200).jsonp(template);
  } catch (err) {
    console.error('post/templates/new', err);
    res.status(500).send('Bad Request');
  }
});

// ABSTRACTION: get template
const getTemplate = async function getTemplate(id) {
  return TemplateModel.get({ id });
};

/**
 * get template
 */
app.get('/templates/:id', async (req, res) => {
  try {
    const template = await getTemplate(req.params.id);
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
    const newTemplate = req.body;
    delete newTemplate.id;
    await TemplateModel.update({ id: templateId }, newTemplate);
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
    // TODO: get count()
    const out = {
      elements: templates,
      total: templates.count,
    };
    res.status(200).jsonp(out);
  } catch (err) {
    console.error('get/templates', err);
    res.status(500).send('Bad Request');
  }
});

// ABSTRACTION: list files
const listFiles = async function listFiles(owner) {
  const files = await InputModel.scan().filter('owner').eq(owner).exec();
  return files.map((file) => file.toJSON());
};

/**
 * list uploaded files
 */
app.get('/file/list', async (req, res) => {
  try {
    const files = await listFiles(req.user.identityId);
    if (files) {
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
 * get file metadata
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

app.delete('/file/:id', async (req, res) => {
  try {
    const file = await InputModel.get({ id: req.params.id });
    // TODO: await proc.storageDelete(file.file, `private/${req.user.identityId}/`);
    // TODO: delete InputModel
    res.status(200).jsonp(file);
  } catch (err) {
    console.error('delete/file/id', err);
    res.status(500).send('Bad Request Delete job');
  }
});

// ABSTRACTION: create input
const createInput = async function createInput(file, id, owner, status = 'In Progress') {
  return InputModel.create({
    file, id, owner, status,
  });
};

/**
 * upload file
 */
app.post('/file', async (req, res) => {
  try {
    const id = req.body.id || uuidv4();
    console.log('body', req.body);
    const size = await proc.sizeOf(req.body.file, `private/${req.user.identityId}/`);
    const file = await InputModel.create({
      file: req.body.file,
      id,
      owner: req.user.identityId,
      status: 'In Progress',
      size,
    });
    // TODO: update Stripe storage usage
    res.status(200).jsonp(file);
  } catch (err) {
    console.error('post/file', err);
    res.status(500).send('Bad Request');
  }
});

/**
 * get a element
 * app.get('/element/:id', async (req, res) => {
  try {
    const element = await ElementModel.get({ id: req.params.id });
    res.status(200).jsonp(element);
  } catch (err) {
    console.error('get/element', err);
    res.status(500).send('Bad Request');
  }
});
 */

// app.functions
app.functions.getTemplate = getTemplate;
app.functions.listFiles = listFiles;
app.functions.createInput = createInput;
app.functions.createTemplate = createTemplate;
app.functions.saveTemplate = saveTemplate;
app.functions.createJob = createJob;
app.functions.saveJob = saveJob;
app.functions.listJobs = listJobs;

// keep at the bottom

app.all('/*', (req, res) => {
  console.log('404', req);
  res.status(404).send('Route not found');
});

module.exports = app;
