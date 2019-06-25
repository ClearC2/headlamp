const path = require('path')

module.exports = () => ({
  output: {
    path: path.join(__dirname, '../../api-explorer-dist'),
    publicPath: '/_docs/'
  }
})
