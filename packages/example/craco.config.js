/* eslint-disable */
const webpack = require('webpack');

module.exports = {
  devServer: {
    proxy: {},
  },
  webpack: {
    configure: {
      resolve: {
        fallback: {
          buffer: require.resolve('buffer/'),
        },
      },
    },
    plugins: [
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }),
    ],
  },
};
