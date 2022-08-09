let publicPath = '/';

switch(process.env.NODE_ENV){
    case 'staging':
        publicPath = '/nft-wallet-vuejs'
        break;
    case 'production':
        publicPath = ''
        break;
}

const { defineConfig } = require('@vue/cli-service')
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")
module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    plugins: [
      new NodePolyfillPlugin()
    ]
  }
})