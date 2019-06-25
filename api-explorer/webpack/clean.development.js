const CleanWebpackPlugin = require('clean-webpack-plugin')

module.exports = (env) => ({
  plugins: [
    new CleanWebpackPlugin(['dist'], {
      root: env.projectDir,
      exclude: ['.gitignore', 'favicon.ico']
    })
  ]
})
