module.exports = {
  publicPath: process.env.BASE_URL,
  productionSourceMap: false,
  configureWebpack: {
    module: {
      rules: [{
        test: require.resolve('zepto'),
        loader: 'exports-loader?window.Zepto!script-loader'
      }]
    }
  },
}
