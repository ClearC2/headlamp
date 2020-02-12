const {NODE_ENV, BABEL_MODULES} = process.env

const useCommonJS = BABEL_MODULES === 'cjs' || NODE_ENV === 'test'

const presets = [
  [
    require.resolve('@babel/preset-env'),
    {
      modules: useCommonJS ? 'commonjs' : false,
      corejs: 3,
      useBuiltIns: 'entry'
    }
  ],
  BABEL_MODULES === 'cjs' ? null : require.resolve('@babel/preset-react')
].filter(Boolean)

const plugins = [
  require.resolve('@babel/plugin-proposal-class-properties'),
  require.resolve('@babel/plugin-proposal-object-rest-spread'),
  require.resolve('@babel/plugin-syntax-dynamic-import'),
  BABEL_MODULES === 'cjs' ? null : require.resolve('react-hot-loader/babel')
].filter(Boolean)

const ignore = []

if (NODE_ENV === 'production') {
  ignore.push('**/__tests__/*.js')
}

module.exports = {
  presets,
  plugins,
  ignore
}
