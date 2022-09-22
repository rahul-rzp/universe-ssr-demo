const universeJestConfig = require('@razorpay/universe-cli/jest.config');

module.exports = {
  ...universeJestConfig,
  transform: {
    '\\.(js|ts|jsx|tsx)?$': './jest-preprocess.js',
  },
  transformIgnorePatterns: ['/node_modules/(?!(@razorpay/blade)/)'],
  moduleNameMapper: {
    // Since jest doesn't know how to resolve these static assets, we mock them
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/jest-fileMock.js',
    '\\.(css)$': '<rootDir>/jest-styleMock.js',
  },
};
