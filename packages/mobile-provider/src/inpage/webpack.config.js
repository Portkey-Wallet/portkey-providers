import path from 'path';
import { fileURLToPath } from 'url';
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
import LodashModuleReplacementPlugin from 'lodash-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
  entry: {
    portkey: './portkey.ts',
    fairyVault: './fairyVault.ts',
  },

  output: {
    path: path.resolve(__dirname, '..', '..', 'dist'),
    filename: '[name]-inpage-content.js',
  },

  mode: 'production',
  module: {
    rules: [
      {
        test: /\.(ts|tsx|js|jsx)$/u,
        exclude: /node_modules/u,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
              plugins: ['@babel/plugin-proposal-object-rest-spread', '@babel/plugin-proposal-class-properties'],
            },
          },
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@portkey/providers': path.resolve(__dirname, '../../../providers/dist/esm/index.js'),
      '@portkey/provider-types': path.resolve(__dirname, '../../../types/dist/esm/index.js'),
      '@portkey/chain': path.resolve(__dirname, '../../../chain/dist/esm/index.js'),
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
  plugins: [new LodashModuleReplacementPlugin()],
};

// module.exports = (_env, argv) => {
export default (_env, argv) => {
  if (argv.mode === 'development') {
    config.mode = 'development';
  }
  return config;
};
