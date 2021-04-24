import sls from 'serverless-http';
import app from './src/app.js';

const run = sls(app);

export default run;
