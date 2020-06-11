const path = require('path');

module.exports = {
  entry: './va/form-controls-va.js',
  output: {
    filename: 'form-controls-va.bundle.js',
    path: path.resolve(__dirname, 'va/bundled-js'),
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
};
