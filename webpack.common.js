const webpack = require('webpack');

module.exports = {
  devtool: 'source-map',
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
  plugins: [
    new webpack.ProvidePlugin({
      // In case we need this in the future
      // $: "jquery",
      // jQuery: "jquery"
    })
  ]
};
