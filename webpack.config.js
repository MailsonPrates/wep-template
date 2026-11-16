const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WatchModuleConfigPlugin = require("./webpack/watch-module-config-plugin");
const CollectInjectedAssetsPlugin = require("./webpack/collect-injected-assets-plugin");
const { IconsCatalogPlugin } = require("./webpack/icons-catalog");

module.exports = (env, argv) => {
  const isProd = argv.mode === 'production';

  return {
    mode: isProd ? 'production' : 'development',
    watch: !isProd, // só assistir em dev
    watchOptions: { ignored: /node_modules/ },

    entry: {
      main: path.resolve(__dirname, 'src/app/root.js'),
      // estilos do app + Bootstrap → public/assets/css/main.css (ver MiniCssExtractPlugin abaixo)
      styles: path.resolve(__dirname, 'src/app/styles/main.scss'),
    },

    output: {
      filename: isProd ? "[name].[contenthash].js" : "[name].js",
      path: path.resolve(__dirname, "public/assets/view/"),
      clean: true, // limpa a pasta a cada build (o main.css fica fora dela)
    },

    optimization: {
      splitChunks: { chunks: "all" },
      runtimeChunk: "single",
      minimize: isProd, // ativa minificação apenas em produção
    },

    devtool: isProd ? false : 'eval-cheap-module-source-map',

    module: {
      rules: [
        {
          test: /\.s[ac]ss$/i,
          use: [
            MiniCssExtractPlugin.loader,
            { loader: 'css-loader', options: { url: false } },
            {
              loader: "sass-loader",
              options: {
                implementation: require("sass"),
                sassOptions: {
                  // o Bootstrap 5.3 ainda usa @import e funções globais do Sass: sem isso o build
                  // imprime centenas de avisos de depreciação que não são do app
                  quietDeps: true,
                  silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'legacy-js-api'],
                },
              },
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
              // React Compiler: memoriza componentes e hooks no build. Escreva componentes simples,
              // sem useMemo/useCallback/React.memo por desempenho (o plugin precisa vir primeiro).
              plugins: [['babel-plugin-react-compiler', { target: '19' }]],
              presets: [
                '@babel/preset-env',
                ['@babel/preset-react', { runtime: 'automatic' }],
              ],
            }
          }
        }
      ]
    },

    plugins: [
      ...(isProd ? [] : [new WatchModuleConfigPlugin()]), // só em dev
      // public/assets/icons/hi2-outline.json: ícones que o painel do Menu pode escolher
      new IconsCatalogPlugin(),
      // nome fixo e fora de view/: o Main.php carrega com cache-busting pela data do arquivo
      new MiniCssExtractPlugin({ filename: '../css/main.css' }),
      // gera storage/builds/view-assets.build.php, que o template PHP (Main.php) injeta na página
      new CollectInjectedAssetsPlugin({ exclude: ['styles'] }),
      // o route-maps.build.js (gerado pelo Core) usa React sem importar
      new webpack.ProvidePlugin({ React: 'react' }),
    ],

    resolve: {
      extensions: ['.js', '.jsx'],
      alias: {
        bs: path.resolve(__dirname, 'node_modules/react-bootstrap/'),
        app: path.resolve(__dirname, 'src/app/'),
        core: path.resolve(__dirname, 'src/app/core/'),
        components: path.resolve(__dirname, 'src/app/components/'),
        hooks: path.resolve(__dirname, 'src/app/hooks/'),
        helpers: path.resolve(__dirname, 'src/app/helpers/'),
        contexts: path.resolve(__dirname, 'src/app/contexts/'),
        modules: path.resolve(__dirname, 'src/Modules/'),
        storage: path.resolve(__dirname, 'storage/'),
        "route-maps": path.resolve(__dirname, "storage/builds/route-maps.build.js"),
        api: path.resolve(__dirname, 'storage/builds/apis/'),
      }
    }
  };
};
