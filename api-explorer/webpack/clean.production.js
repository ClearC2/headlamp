const path = require('path')
const CleanWebpackPlugin = require('clean-webpack-plugin')

module.exports = () => ({
  plugins: [
    new CleanWebpackPlugin(['api-explorer-dist'], {
      root: path.resolve(__dirname, '..', '..'),
      exclude: ['.gitignore', 'favicon.ico']
    })
  ]
})
