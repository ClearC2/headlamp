const {webpackUtils} = require('@clearc2/c2-react-config')

module.exports = (env) => webpackUtils.extendPreset(env, 'dev-server.development',
  {
    devServer: {
      port: 8082,
      overlay: false
    }
  }
)
