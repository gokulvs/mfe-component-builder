const path = require('path');
const paths = require('../bin/paths');

const HtmlWebpackPlugin = require("html-webpack-plugin");
const ModuleFederationPlugin =
  require("webpack").container.ModuleFederationPlugin;

const packageJson = require(path.resolve(paths.appPath,"./package.json"));

const getVersion = function(lib,defaultVersion = ''){
  if(packageJson.peerDependencies && packageJson.peerDependencies[lib]){
    return packageJson.peerDependencies[lib];
  }

  if(packageJson.dependencies[lib]){
    return packageJson.dependencies[lib];
  }

  if(packageJson.devDependencies && packageJson.devDependencies[lib]){
    return packageJson.devDependencies[lib];
  }

  return defaultVersion;
}

module.exports = function (webpackEnv) {
  console.log('in webpack config')
  return {
    entry: path.resolve(paths.appSrc,'./index.js'),
    mode: webpackEnv,
    devtool: webpackEnv === 'development' ?'source-map':false,
    devServer: {
      static: {
        directory: paths.appDist,
      },
      port: 3002,
    },
    output: {
      publicPath: "auto",
      chunkFilename: '[contenthash].[id].chunk.js'
    },
    performance: {
      hints: false,
      maxEntrypointSize: 5120000,
      maxAssetSize: 5120000
    },
    module: {
      rules: [
        {
          test: /\.m?js$/,
          type: "javascript/auto",
          resolve: {
            fullySpecified: false,
          },
        },
        { 
          test: /\.js$/, 
          use: {
            loader: 'babel-loader',
            options: {
              customize: require.resolve(
                'babel-preset-react-app/webpack-overrides'
              ),
              presets: [
                [
                  require.resolve('babel-preset-react-app'),
                  {
                    runtime: 'classic',
                  },
                ],
              ],
            }
          }
          
        },
        {
          test: /\.(scss|css)$/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              // options: { sourceMap: true, importLoaders: 1, modules: true },
            },
            // { loader: 'postcss-loader', options: { sourceMap: true } },
            { loader: 'sass-loader', options: { sourceMap: true } },
          ],
        },
        // Images: Copy image files to build folder
        { test: /\.(?:ico|gif|png|jpg|jpeg)$/i, type: 'asset/resource' },

        // Fonts and SVGs: Inline files
        { test: /\.(woff(2)?|eot|ttf|otf|svg|)$/, type: 'asset/inline' },
        {
          test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          include: path.resolve(paths.appNodeModules,'./bootstrap-icons/font/fonts'),
          use: {
              loader: 'file-loader',
              options: {
                  name: '[name].[ext]',
                  outputPath: 'webfonts',
                  publicPath: '../webfonts',
              },
          }
        }
      ],
    },
    plugins: [
      new ModuleFederationPlugin({
        name: packageJson.componentName,
        filename: "remoteEntry.js",
        exposes: {
          "./Widget": path.resolve(paths.appSrc,'./Widget.js'),
        },
        shared: [
          {
            react: { 
              singleton: true, 
              requiredVersion: getVersion('react','^17.0.2') 
            },
            "react-dom": { 
              singleton: true,
              requiredVersion: getVersion('react-dom','^17.0.2') 
            },
            "react-intl": {
              singleton: true,
              requiredVersion: getVersion('react-intl','^5.21.0')
            },
            "react-redux": {
              singleton: true,
              requiredVersion: getVersion('react-redux','^7.2.4')
            },
             "react-i18next": {
              singleton: true,
              requiredVersion: getVersion('react-i18next','^11.15.3')
            }
          },
        ],
      }),
       new HtmlWebpackPlugin({
        title: 'Base UI',
        favicon: './public/favicon.ico',
        template: './public/index.html', // template file
        filename: 'index.html', // output file
      }),
    ],
  };
}