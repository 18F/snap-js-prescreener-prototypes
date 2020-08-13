const path = require('path');

module.exports = {
  entry: './prescreeners/form-controls.js',
  output: {
    filename: 'form-controls.bundle.js',
    path: path.resolve(__dirname, 'prescreeners/shared/js'),
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
