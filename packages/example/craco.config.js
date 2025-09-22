/* eslint-disable */
const webpack = require('webpack');

module.exports = {
  devServer: {
    proxy: {},
  },
  webpack: {
    configure: webpackConfig => {
      webpackConfig.module.rules.push({
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react", "@babel/preset-typescript"],
          },
        },
      });
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        // buffer: require.resolve('buffer'),
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer'),
        fs: false,
        child_process: false,
        // "vm": require.resolve("vm-browserify"),
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        "zlib": require.resolve("browserify-zlib"),
        "vm": require.resolve("vm-browserify"),
        'process/browser': require.resolve('process/browser')
      };
      webpackConfig.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
        }),
        new webpack.ProvidePlugin({
          process: 'process/browser'
        }),
      );
      return webpackConfig;
    },
  },
};
