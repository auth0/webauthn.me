const webpack = require('webpack');
const path = require('path')

module.exports = {
  devtool: 'source-map',
  target: 'web',
  module: {
    rules: [{
      test: /\.m?js$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [[
            '@babel/preset-env', {
              targets: {
                chrome: 67,
                firefox: 60,
                edge: 18
              },
              modules: false
            }
          ]]
        }
      }
    }]
  },
  resolve: {
    extensions: ['.js'],
    fallback: {
      util: require.resolve('util'),
      url: require.resolve('url'),
      events: require.resolve('events'),
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer/'),
      process: require.resolve('process/browser')
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer',  'Buffer'],
      process: 'process/browser'
      // In case we need this in the future
      // $: "jquery",
      // jQuery: "jquery"
    })
  ],
  cache: {
    type: 'filesystem'
  }
};
