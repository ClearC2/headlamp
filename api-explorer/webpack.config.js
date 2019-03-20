const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const extractCSS = new ExtractTextPlugin('[name].css')
const NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV : 'development'

let config = {
  entry: {
    app: [
      'babel-polyfill',
      'url-search-params-polyfill',
      path.resolve(__dirname, 'src', 'index.js'),
      'webpack-dev-server/client?http://localhost:8083'
    ]
  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    historyApiFallback: true,
    inline: true,
    port: 8083,
    hot: true
  },
  plugins: [
    new CleanWebpackPlugin([path.join(__dirname, '../api-explorer-dist')]),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src', 'index.ejs')
    }),
    extractCSS,
    new webpack.DefinePlugin({
      'global.NODE_ENV': JSON.stringify(NODE_ENV)
    })
  ],
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: { loader: 'babel-loader' }
      },
      {
        test: /\.css$/,
        loader: extractCSS.extract({
          fallback: 'style-loader',
          use: [ 'css-loader' ]
        })
      },
      {
        test: /\.otf(\?v=\d+\.\d+\.\d+)?$/,
        use: [ 'file-loader' ]
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        use: [ 'file-loader' ]
      },
      {
        test: /\.mp3$/,
        use: [ 'file-loader' ]
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: [{
          loader: 'url-loader',
          options: { limit: 10000, mimetype: 'application/font-woff' }
        }]
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
          loader: 'url-loader',
          options: { limit: 10000, mimetype: 'application/octet-stream' }
        }]
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
          loader: 'url-loader',
          options: { limit: 10000, mimetype: 'image/svg+xml' }
        }]
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: [{
          loader: 'url-loader',
          options: { limit: 8192 }
        }]
      }
    ]
  }
}

if (process.env.NODE_ENV === 'production') {
  config.entry.app = [
    'babel-polyfill',
    'url-search-params-polyfill',
    path.resolve(__dirname, 'src', 'index.js')
  ]
  config.output.path = path.join(__dirname, '../api-explorer-dist')
  config.output.publicPath = '/_docs/'
}

module.exports = config
