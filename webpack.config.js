const path = require('path');

module.exports = {
  watch: true,
  watchOptions: { 
    ignored: "/node_modules/",
  },
  mode: 'development',
  entry: path.resolve(__dirname, 'src/Common/view/app/root.js'),
  output: {
    filename: "view/[name].js?v="+(Date.now()),
    path: path.resolve(__dirname, "public/assets/"),
    chunkFilename: (pathData) => {
      return `view/${pathData.chunk.id.replace('_js', '')}.js?v=${Date.now()}`;
    },
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
    ]
  },

  plugins: [
  ],

  resolve: {
    extensions: ['.js'],
    alias: {
      ui: path.resolve(__dirname, 'src/Common/view/ui/'),
      app: path.resolve(__dirname, 'src/Common/view/app/'),
      modules: path.resolve(__dirname, 'src/Modules/'),
      storage: path.resolve(__dirname, 'storage/'),
      jeact: path.resolve(__dirname, 'node_modules/@mailson-prates/jeact/src/'),
      "route-maps": path.resolve(__dirname, "storage/builds/route-maps.build.js"),
      core: path.resolve(__dirname, 'vendor/mailsonprates/wep/src/front/'),
      api: path.resolve(__dirname, 'storage/builds/apis/'),
    }
  },
};