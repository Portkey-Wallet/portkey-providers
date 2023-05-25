/* eslint-disable */
const webpack = require('webpack');
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const projectRoot = __dirname;

const outputDir = 'dist';
// module.exports =
let config = {
  // When mode is production or not defined, minimize is enabled. This option automatically adds Uglify plugin.
  // production will remove the 'dead code'. Look at Tree Shaking
  // mode: 'none',
  devtool: 'source-map',
  // mode: 'development',
  entry: './src/index.ts',
  output: {
    path: path.resolve(projectRoot, outputDir),
    filename: 'index.js',
    library: "my-library",
    libraryTarget: "umd"
  },

  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.json'],
    fallback: {
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer'),
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: '/node-modules/',
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
          {
            loader: 'ts-loader',
            options: {
              compilerOptions: {
                noEmit: false,
              },
            },
          },
        ],
      },
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false,
        },
      },
    ],
  },
  plugins: [
    // Ignore all local files of moment.js
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/,
    }),
    new CleanWebpackPlugin({
      verbose: true,
      cleanStaleWebpackAssets: false,
      cleanOnceBeforeBuildPatterns: [path.join(process.cwd(), `./${outputDir}/*`)],
      // remove files that are not created directly by Webpack.
      // cleanAfterEveryBuildPatterns
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
};

module.exports = (env, argv) => {

  if (argv.mode === 'production') {
    config.plugins.push(
      new TerserPlugin({
        //   cache: true,
        parallel: true,
        extractComments: false, // Do not extract comments to separate file summary
        terserOptions: {
          ecma: undefined,
          warnings: false,
          parse: {},
          mangle: true, // Note `mangle.properties` is `false` by default.
          module: false,
          output: null,
          toplevel: false,
          nameCache: null,
          ie8: false,
          keep_classnames: undefined,
          keep_fnames: false,
          safari10: false,
          compress: {
            drop_debugger: true,
            drop_console: true,
          },
        },
      }),
    );
  }

  return config;
};
