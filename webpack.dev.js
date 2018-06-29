const merge = require('webpack-merge');

const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  entry: {
    index: './src/index.js',
  },
  output: {
    filename: '[name].js',
    path: __dirname + '/dist/js'
  }
});
