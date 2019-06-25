const path = require('path')
const {webpackConfig} = require('@clearc2/c2-react-config')

const {presets} = webpackConfig

presets.common = presets.common.concat(['alias', 'rules', 'define'])

module.exports = (env) => {
  env.presetDir = path.join(__dirname, 'webpack')
  env.projectDir = __dirname
  return webpackConfig(env)
}
