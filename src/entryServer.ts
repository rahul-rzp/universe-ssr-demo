import http from 'http';
import { makeApp } from '@razorpay/universe-cli/express';
import errorService from '@razorpay/universe-cli/errorService';
import compression from 'compression';
import slashes from 'connect-slashes';
import chalk from 'chalk';

import packageJson from '../package.json';
import abMiddleware from './shared/services/abMiddleware';
import identityMiddleware from './shared/services/identityMiddleware';
import renderMiddleware from './shared/services/renderMiddleware';
import env from './env';

if (env.STAGE !== 'development' && env.UNIVERSE_PUBLIC_SENTRY_DSN) {
  errorService.init({
    dsn: env.UNIVERSE_PUBLIC_SENTRY_DSN,
    environment: env.STAGE,
    version: `${__APP_NAME__}@${__VERSION__}`,
  });
}

const app = makeApp({
  name: packageJson.name,
  version: packageJson.version,
  buildDirectory: 'build',
  staticDirectory: 'static',
});

app.use(compression());
app.use(identityMiddleware());
app.use(abMiddleware());
// force trailing slashes with a 301 redirect
app.use(slashes(true));
app.use(renderMiddleware());

// errorHandlerMiddleware should be present after all your routes and middleware
// If you have other error handlers, ensure that errorHandlerMiddleware is present before them
app.use(errorService.errorHandlerMiddleware());
// custom error handler for malformed URI which express does not handle correctly
app.use(errorService.malformedURIErrorHandlerMiddleware);

const httpServer = http.createServer(app);

httpServer.listen(env.SERVER_PORT, () => {
  // eslint-disable-next-line no-console
  console.log(chalk.green(`server is listening at http://localhost:${env.SERVER_PORT}`));
});
