const dynamoose = require('dynamoose');
const express = require('express');

const app = express();
const region = 'us-east-1';

const bodyParser = require('body-parser');
const services = require('./services');
const models = require('./models');

// This is all stuff for API Models
const Element = require('./models/Element.json');
const ElementResponse = require('./models/ElementResponse.json');
const ElementListResponse = require('./models/ElementListResponse.json');

const LoginModel = require('./models/LoginModel.json');
const LoginResponseModel = require('./models/LoginResponseModel.json');

const OutputResponse = require('./models/OutputResponse.json');
const OutputResponseList = require('./models/OutputResponseList.json');
const Template = require('./models/Template.json');
const TemplateResponse = require('./models/TemplateResponse.json');
const TemplateResponseList = require('./models/TemplateResponseList.json');
const View = require('./models/View.json');

// const jsonServer = require('json-server')

if (['local', 'test'].contains(process.env.NODE_ENV)) {
  dynamoose.aws.ddb.local();
  console.log('Connected to DynamoDB localhost');
} else {
  dynamoose.aws.sdk.config.update({
    region,
  });
  console.log('Updated Dynamo Config');
}
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const jsf = {}; // TODO: remove all jsfs

const modelRefs = {
  Element,
  ElementResponse,
  ElementListResponse,
  OutputResponse,
  OutputResponseList,
  Template,
  TemplateResponse,
  TemplateResponseList,
  View,
};

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
  if (req.headers.authorization === undefined || req.headers.authorization.split(' ')[0] !== 'Bearer') {
    const status = 401;
    const message = 'Bad authorization header';
    console.log(req.headers.authorization);
    res.status(status).json({ status, message });
    return;
  }
  try {
    verifyToken(req.headers.authorization.split(' ')[1]);
    next();
  } catch (err) {
    const status = 401;
    const message = 'Error: access_token is not valid';
    res.status(status).json({ status, message });
  }
});

/**
 * get info about a single job
 */
app.get('/jobs/:uuid', (req, res) => {
  const rand = jsf.generate(OutputResponse, modelRefs);
  res.status(200).jsonp(rand);
});

/**
 * create job / apply template to file
 */
app.post('/jobs', (req, res) => {
  const elements = jsf.generate(OutputResponse, modelRefs);
  const response = {
    elements,
  };
  res.status(200).jsonp(response);
});

/**
 * get jobs / outputs list
 */
app.get('/jobs', (req, res) => {
  const rand = jsf.generate(OutputResponseList, modelRefs);
  res.status(200).jsonp(rand);
});

/**
 * create new template
 */
app.post('/templates/new', (req, res) => {
  const rand = jsf.generate(OutputResponseList, modelRefs);
  res.status(200).jsonp(rand);
});

/**
 * get template
 */
app.get('/templates/:uuid', (req, res) => {
  const rand = jsf.generate(TemplateResponse, modelRefs);
  res.status(200).jsonp(rand);
});

/**
 * update template
 */
app.patch('/templates/:uuid', (req, res) => {
  const rand = jsf.generate(TemplateResponse, modelRefs);
  res.status(200).jsonp(rand);
});

/**
 * list templates
 */
app.get('/templates', (req, res) => {
  const rand = jsf.generate(TemplateResponseList, modelRefs);
  res.status(200).jsonp(rand);
});

/**
 * list uploaded files
 */
app.get('/file/list', (req, res) => {
  const rand = jsf.generate(ElementListResponse, modelRefs);
  res.status(200).jsonp(rand);
});

/**
 * upload file
 */
app.post('/file', (req, res) => {
  const rand = jsf.generate(ElementListResponse, modelRefs);
  res.status(200).jsonp(rand);
});

/**
 * get a file
 */
app.get('/file', (req, res) => {
  const rand = jsf.generate(Element, modelRefs);
  res.status(200).jsonp(rand);
});

// app.post('/login', (req, res) => {
//   const rand = jsf.generate(LoginResponseModel)
//   res.status(200).jsonp(rand)
// })

// keep at the bottom

app.post('/auth/logout', (req, res) => {
  const rand = jsf.generate(LoginModel);
  res.status(200).jsonp(rand);
});

// app.post('/auth/login', (req, res) => {
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (isAuthenticated({ username, password }) === false) {
    const status = 401;
    const message = 'Incorrect username or password';
    res.status(status).jsonp({ status, message });
  } else {
    const accessToken = createToken({ username, password });
    // res.cookie('access_token', access_token)
    // res.header('Set-Cookie', `access_token=${access_token}`)
    res.header('Authorization', `Bearer ${accessToken}`);
    // res.status(200).jsonp({ access_token })
    const rand = Object.assign(jsf.generate(LoginResponseModel), { token: accessToken });
    res.status(200).jsonp(rand);
  }
});

app.get('/*', (req, res) => {
  res.status(404).send('Route not found');
});

module.exports = app;
