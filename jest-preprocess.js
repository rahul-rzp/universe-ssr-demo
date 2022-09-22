const babelOptions = require('./.babelrc');

// eslint-disable-next-line import/no-extraneous-dependencies
module.exports = require('babel-jest').createTransformer(babelOptions);
