const { merge } = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin')
const devConfig = require('./webpack.dev.js');

module.exports = merge(devConfig, {
  mode: 'production',
  devtool: false,
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
       terserOptions: {
         format: {
          comments:false,
        }
       },
       extractComments: false
      })
    ]
  }
});
