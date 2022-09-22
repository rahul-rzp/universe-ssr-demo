const execa = require('execa');
const universeDangerJs = require('@razorpay/universe-cli/danger.web');

/**
 * `beforeLighthouse` runs before lighthouse audit is ran on the provided URL
 * @param {object} browser - The browser instance started by puppeteer
 * @param {string} url - The URL provided as part config for auditing
 */
async function beforeLighthouse() {
  // build application for localhost
  const { exitCode } = execa.commandSync('yarn beta:build');
  if (exitCode !== 0) {
    throw new Error('yarn beta:build failed to run');
  }
  /**
   * serve application for localhost, server keeps running in the background
   * we are not using `await execa.command()` syntax as it is not working properly
   * at the moment and causing timeout issue on CI
   */
  execa.command('yarn beta:serve');
  await new Promise((resolve) => setTimeout(resolve, 10000));
}

/**
 * `afterLighthouse` runs after lighthouse audit is ran on the specified URL
 * @param {object} browser - The browser instance started by puppeteer
 * @param {string} url - The URL provided as part config for auditing
 */
function afterLighthouse() {
  // kill application server started as part of serve command in beforeLighthouse function
  execa.commandSync(`npx kill-port ${process.env.SERVER_PORT}`);
}

universeDangerJs({
  auditPerformance: {
    type: 'warn',
    config: {
      localhost: {
        url: `http://localhost:${process.env.SERVER_PORT}`,
        beforeLighthouse,
        afterLighthouse,
      },
    },
  },
});
