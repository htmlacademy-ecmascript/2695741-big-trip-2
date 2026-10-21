const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/main.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'build'),
    clean: true,
  },
  devtool: 'source-map',
  plugins: [
    new HtmlPlugin({
      template: './public/index.html',
    }),
    new CopyPlugin({
      patterns: [{
        from: 'public',
        globOptions: {
          ignore: ['**/index.html'],
        },
      }],
    }),
  ],
  devServer: {
    port: 8080,
  },
};
