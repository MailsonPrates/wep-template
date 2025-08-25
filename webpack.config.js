const path = require('path');
const WatchModuleConfigPlugin = require("./webpack/watch-module-config-plugin");
const CollectInjectedAssetsPlugin = require("./webpack/collect-injected-assets-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  watch: true,
  watchOptions: { 
    ignored: "/node_modules/",
  },
  mode: 'development',
  entry: path.resolve(__dirname, 'src/Common/view/app/root.js'),
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "public/assets/view/"),
  },
  optimization: {
    splitChunks: {
      chunks: "all",
    },
    runtimeChunk: "single",
  },
  module: {
    rules: [
      {
        test:  /\.s[ac]ss$/i,
        use: [
          'style-loader', 
          'css-loader',
          {
            loader: "sass-loader",
            options: {
              implementation: require("sass"),
            },
          }
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource'
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react']
            }
          },
        ]
      }
    ]
  },

  plugins: [
    new WatchModuleConfigPlugin(),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin(),
    new CollectInjectedAssetsPlugin()
  ],

  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      bs: path.resolve(__dirname, 'node_modules/react-bootstrap/'),
      ui: path.resolve(__dirname, 'src/Common/view/ui/'),
      app: path.resolve(__dirname, 'src/Common/view/app/'),
      modules: path.resolve(__dirname, 'src/Modules/'),
      storage: path.resolve(__dirname, 'storage/'),
      "route-maps": path.resolve(__dirname, "storage/builds/route-maps.build.js"),
      core: path.resolve(__dirname, 'vendor/wep/framework/src/front/'),
      api: path.resolve(__dirname, 'storage/builds/apis/'),
    }
  },
};