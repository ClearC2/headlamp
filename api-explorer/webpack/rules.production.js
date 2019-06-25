module.exports = () => ({
  module: {
    rules: [
      {
        test: /\.otf$/,
        use: 'file-loader'
      }
    ]
  }
})
