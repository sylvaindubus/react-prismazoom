const path = require('path')
const HtmlPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const EslintPlugin = require('eslint-webpack-plugin')

module.exports = {
  entry: path.join(__dirname, 'src'),
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: { presets: ['@babel/env', '@babel/preset-react'] },
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        exclude: /node_modules/,
        use: {
          loader: 'file-loader',
          options: {
            name: 'img-[hash:6].[ext]',
          },
        },
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlPlugin({
      template: path.join(__dirname, 'index.html'),
      filename: './index.html',
    }),
    new CopyPlugin({
      patterns: [{ from: 'src/static', to: 'static' }],
    }),
    new EslintPlugin(),
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  devServer: {
    port: 1664,
  },
}
