/* eslint-disable */
import webpack from 'webpack';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = __dirname;
const ROOT = path.resolve(__dirname, '.');
// const { version, name } = require(path.resolve(ROOT, './package.json'));
const packageJson = JSON.parse(fs.readFileSync(path.resolve(ROOT, './package.json'), 'utf-8'));
const { version, name } = packageJson;
const banner = `${name} v${version}\n(c) 2023-${new Date().getFullYear()} Portkey\nReleased under ISC License`;

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
    library: 'my-library',
    libraryTarget: 'umd',
  },

  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.json'],
    alias: {
      // 优先使用ESM版本的依赖包
      '@portkey/providers': path.resolve(__dirname, '../providers/dist/esm/index.js'),
      '@portkey/provider-types': path.resolve(__dirname, '../types/dist/esm/index.js'),
      '@portkey/chain': path.resolve(__dirname, '../chain/dist/esm/index.js'),
    },
    fallback: {
      // Node.js polyfills for browser environment
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
    new webpack.BannerPlugin({
      banner,
      entryOnly: true,
    }),
  ],
};

// module.exports = (env, argv) => {
export default (env, argv) => {
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
