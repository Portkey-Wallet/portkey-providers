import path from 'path';
import fs from 'fs';
import webpack from 'webpack';
import TerserPlugin from 'terser-webpack-plugin';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '.');

// const { version, name } = require(path.resolve(ROOT, './package.json'));
const packageJson = JSON.parse(fs.readFileSync(path.resolve(ROOT, './package.json'), 'utf-8'));
const { version, name } = packageJson;
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
  resolve: {
    alias: {
      '@portkey/providers': path.resolve(__dirname, '../providers/dist/esm/index.js'),
      '@portkey/provider-types': path.resolve(__dirname, '../types/dist/esm/index.js'),
      '@portkey/chain': path.resolve(__dirname, '../chain/dist/esm/index.js'),
    },
    fallback: {
      stream: false,
      buffer: false,
      crypto: false,
      path: false,
      os: false,
      url: false,
      http: false,
      https: false,
      zlib: false,
      fs: false,
      child_process: false,
    },
  },
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

// module.exports = (_env, argv) => {
export default (_env, argv) => {
  if (argv.mode === 'development') {
    config.mode = 'development';
  }
  return config;
};
