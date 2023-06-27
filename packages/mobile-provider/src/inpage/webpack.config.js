const path = require('path');
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const config = {
  entry: './index.ts',

  output: {
    path: path.resolve(__dirname, '..', '..', 'dist'),
    filename: 'inpage-content.js',
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
    fallback: {
      stream: false,
    },
  },
  // plugins: [new BundleAnalyzerPlugin()],
};

module.exports = (_env, argv) => {
  if (argv.mode === 'development') {
    config.mode = 'development';
  }
  return config;
};
