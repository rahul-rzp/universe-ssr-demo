/* eslint-disable no-param-reassign */
const SentryWebpackPlugin = require('@sentry/webpack-plugin');
const packageJson = require('./package.json');

module.exports = {
  browserConfig: ({ config }) => {
    // webpack browser config to run your project in browser
    // config object comes with basic webpack configurations.
    // You add/modify any property if you have justification for it :P
    config.entry.push('./src/entryBrowser');
    if (process.env.SENTRY_SOURCE_MAP_UPLOAD === 'true') {
      config.plugins.push(
        new SentryWebpackPlugin({
          include: './build/browser/',
          ignore: ['node_modules', 'webpack.config.js'],
          urlPrefix: '~/build/browser/',
          release: `${packageJson.name}@${packageJson.version}`,
          deploy: {
            env: process.env.STAGE,
          },
        }),
      );
    }

    return config;
  },
  serverConfig: ({ config }) => {
    // webpack server config to run your project on a server
    // config object comes with basic webpack configurations.
    // You add/modify any property if you have justification for it :P
    config.module.rules[0].exclude = new RegExp('/node_modules/(?!(@razorpay/commander)).*/');
    config.entry.push('./src/entryServer');
    if (process.env.SENTRY_SOURCE_MAP_UPLOAD === 'true') {
      config.plugins.push(
        new SentryWebpackPlugin({
          include: './build/server',
          release: `${packageJson.name}@${packageJson.version}`,
          ignore: ['node_modules', 'webpack.config.js'],
          deploy: {
            env: process.env.STAGE,
          },
        }),
      );
    }

    return config;
  },
};
