const path = require('path');
require('dotenv-flow').config();
const webpack = require('webpack');
const ZipPlugin = require('zip-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './index.js',
  target: 'node',
  output: {
    filename: 'index.js',
    libraryTarget: 'commonjs',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new ZipPlugin({
      filename: 'main.zip',
    }),
    new webpack.DefinePlugin({
      'process.env.FLUENTFFMPEG_COV': false,
    }),
  ],
};
