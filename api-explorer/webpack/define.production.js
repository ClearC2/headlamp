const webpack = require('webpack')

const NODE_ENV = process.env.NODE_ENV || 'production'

module.exports = () => ({
  plugins: [
    new webpack.DefinePlugin({
      'global.NODE_ENV': JSON.stringify(NODE_ENV)
    })
  ]
})
