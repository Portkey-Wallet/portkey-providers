const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

const ROOT = path.resolve(__dirname, '.');

const { version, name } = require(path.resolve(ROOT, './package.json'));
const banner = `${name} v${version}\n(c) 2023-${new Date().getFullYear()} Portkey\nReleased under ISC License`;

const distPath = path.resolve(__dirname, 'dist');
const files = fs.readdirSync(distPath);
const entryFiles = files.filter(file => file.startsWith('raw-index-') && file.endsWith('-bundle.js'));

const entry = {};
entryFiles.forEach(file => {
  const outputFileName = file.replace('raw-index-', '').replace('inpage-bundle.js', '');
  entry[outputFileName] = path.join(distPath, file);
});

const config = {
  entry: entry,

  output: {
    path: distPath,
    filename: 'mini-[name].js',
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
