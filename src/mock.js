'use strict'
// const express = require('express')
// const app = express()

const faker = require('faker')

const jsf = require('json-schema-faker')
jsf.extend('faker', () => faker)
jsf.locate('faker')

// new

const Element = require('./mocks/Element.json')
const ElementResponse = require('./mocks/ElementResponse.json')
const ElementListResponse = require('./mocks/ElementListResponse.json')

const LoginModel = require('./mocks/LoginModel.json')
const LoginResponseModel = require('./mocks/LoginResponseModel.json')

const OutputResponse = require('./mocks/OutputResponse.json')
const OutputResponseList = require('./mocks/OutputResponseList.json')
const Template = require('./mocks/Template.json')
const TemplateResponse = require('./mocks/TemplateResponse.json')
const TemplateResponseList = require('./mocks/TemplateResponseList.json')
const View = require('./mocks/View.json')

const bodyParser = require('body-parser')
const jsonServer = require('json-server')
const jwt = require('jsonwebtoken')

const app = jsonServer.create()

let router = jsonServer.router({})

const mockRefs = [
  Element,
  ElementResponse,
  ElementListResponse,
  OutputResponse,
  OutputResponseList,
  Template,
  TemplateResponse,
  TemplateResponseList,
  View,
]

const SECRET_KEY = '123456789'
const expiresIn = '1h'

// Create a token from a payload
function createToken(payload) {
  return jwt.sign(payload, SECRET_KEY, { expiresIn })
}

// Verify the token
function verifyToken(token) {
  return jwt.verify(token, SECRET_KEY, (err, decode) => decode !== undefined ? decode : err)
}

// Check if the user exists in database
function isAuthenticated({ username, password }) {
  return (username && password)
  // return userdb.users.findIndex(user => user.username === 'user@example.com' && user.password === 'password') !== -1
}
const middlewares = jsonServer.defaults()

app.use((req, res, next) => {
  res.header('Allow')
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', '*')
  res.header('Access-Control-Request-Headers', 'Origin, Content-Type, X-Auth-Token, Authorization, Set-Cookie')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header('Access-Control-Request-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header('Content-Type', 'application/javascript')
  next()
})

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.options('/*', (req, res) => {
  res.status(200).jsonp({})
})

// app.use(/^(?!\/auth).*$/, (req, res, next) => {
app.use(/^(?!\/login).*$/, (req, res, next) => {
  if (req.headers.authorization === undefined || req.headers.authorization.split(' ')[0] !== 'Bearer') {
    const status = 401
    const message = 'Bad authorization header'
    console.log(req.headers.authorization)
    res.status(status).json({ status, message })
    return
  }
  try {
    verifyToken(req.headers.authorization.split(' ')[1])
    next()
  } catch (err) {
    const status = 401
    const message = 'Error: access_token is not valid'
    res.status(status).json({ status, message })
  }
})

/**
 * get info about a single job
 */
app.get('/jobs/:uuid', (req, res) => {
  const rand = jsf.generate(OutputResponse, mockRefs)
  res.status(200).jsonp(rand)
})

/**
 * create job / apply template to file
 */
app.post('/jobs', (req, res) => {
  const elements = jsf.generate(OutputResponse, mockRefs)
  let response = {
    elements
  }
  res.status(200).jsonp(response)
})

/**
 * get jobs / outputs list
 */
app.get('/jobs', (req, res) => {
  const rand = jsf.generate(OutputResponseList, mockRefs)
  res.status(200).jsonp(rand)
})

/**
 * create new template
 */
app.post('/templates/new', (req, res) => {
  const rand = jsf.generate(OutputResponseList, mockRefs)
  res.status(200).jsonp(rand)
})

/**
 * get template
 */
app.get('/templates/:uuid', (req, res) => {
  const rand = jsf.generate(TemplateResponse, mockRefs)
  res.status(200).jsonp(rand)
})

/**
 * update template
 */
app.patch('/templates/:uuid', (req, res) => {
  const rand = jsf.generate(TemplateResponse, mockRefs)
  res.status(200).jsonp(rand)
})

/**
 * list templates
 */
app.get('/templates', (req, res) => {
  const rand = jsf.generate(TemplateResponseList, mockRefs)
  res.status(200).jsonp(rand)
})

/**
 * list uploaded files
 */
app.get('/file/list', (req, res) => {
  const rand = jsf.generate(ElementListResponse, mockRefs)
  res.status(200).jsonp(rand)
})

/**
 * upload file
 */
app.post('/file', (req, res) => {
  const rand = jsf.generate(ElementListResponse, mockRefs)
  res.status(200).jsonp(rand)
})

/**
 * get a file
 */
app.get('/file', (req, res) => {
  const rand = jsf.generate(Element, mockRefs)
  res.status(200).jsonp(rand)
})

// app.post('/login', (req, res) => {
//   const rand = jsf.generate(LoginResponseModel)
//   res.status(200).jsonp(rand)
// })

// keep at the bottom

app.post('/auth/logout', (req, res) => {
  const rand = jsf.generate(LoginModel)
  res.status(200).jsonp(rand)
})

// app.post('/auth/login', (req, res) => {
app.post('/login', (req, res) => {
  const { username, password } = req.body
  if (isAuthenticated({ username, password }) === false) {
    const status = 401
    const message = 'Incorrect username or password'
    res.status(status).jsonp({ status, message })
  } else {
    const access_token = createToken({ username, password })
    // res.cookie('access_token', access_token)
    // res.header('Set-Cookie', `access_token=${access_token}`)
    res.header('Authorization', `Bearer ${access_token}`)
    // res.status(200).jsonp({ access_token })
    const rand = Object.assign(jsf.generate(LoginResponseModel), { token: access_token })
    res.status(200).jsonp(rand)
  }
})

app.get('/*', (req, res) => {
  res.status(404).send('Route not found')
})

module.exports = app
