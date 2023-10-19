const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

const ROOT = path.resolve(__dirname, '.');

const { version, name } = require(path.resolve(ROOT, './package.json'));
const banner = `${name} v${version}\n(c) 2023-${new Date().getFullYear()} Portkey\nReleased under ISC License`;

const config = {
  entry: './dist/index-raw.js',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
  },

  mode: 'production',
  plugins: [
    new webpack.BannerPlugin({
      banner,
      entryOnly: true,
    }),
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
      }),
    ],
  },
};

module.exports = (_env, argv) => {
  if (argv.mode === 'development') {
    config.mode = 'development';
  }
  return config;
};
