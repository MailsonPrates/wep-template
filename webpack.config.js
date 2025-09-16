const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WatchModuleConfigPlugin = require("./webpack/watch-module-config-plugin");
const CollectInjectedAssetsPlugin = require("./webpack/collect-injected-assets-plugin");

module.exports = (env, argv) => {
  const isProd = argv.mode === 'production';

  return {
    mode: isProd ? 'production' : 'development',
    watch: !isProd, // só assistir em dev
    watchOptions: { ignored: "/node_modules/" },

    entry: path.resolve(__dirname, 'src/Common/view/app/root.js'),

    output: {
      filename: isProd ? "[name].[contenthash].js" : "[name].js",
      path: path.resolve(__dirname, "public/assets/view/"),
      clean: true, // limpa a pasta automaticamente no Webpack 5
    },

    optimization: {
      splitChunks: { chunks: "all" },
      runtimeChunk: "single",
      minimize: isProd, // ativa minificação apenas em produção
    },

    module: {
      rules: [
        {
          test: /\.s[ac]ss$/i,
          use: [
            'style-loader',
            'css-loader',
            {
              loader: "sass-loader",
              options: { implementation: require("sass") }
            }
          ],
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
        },
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react']
            }
          }
        }
      ]
    },

    plugins: [
      ...(isProd ? [] : [new WatchModuleConfigPlugin()]), // só em dev
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        minify: isProd && {
          collapseWhitespace: true,
          removeComments: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true,
        },
      }),
      new CollectInjectedAssetsPlugin(),
      new webpack.ProvidePlugin({
        React: 'react'
      })
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
        core: path.resolve(__dirname, 'src/Common/view/app/core/'),
        api: path.resolve(__dirname, 'storage/builds/apis/'),
      }
    }
  };
};
