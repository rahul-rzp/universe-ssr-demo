import React from 'react';
import { render } from 'react-dom';
import { loadableReady } from '@loadable/component';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import errorService from '@razorpay/universe-cli/errorService';
import ErrorBoundary from '@razorpay/universe-cli/errorService/ErrorBoundary';
import { hydrate, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@fontsource/lato/400.css';
import '@fontsource/lato/700.css';

import hydrateApp from './shared/services/hydrateApp';
import env from './env';
import Content from './content';

if (env.STAGE !== 'development' && env.UNIVERSE_PUBLIC_SENTRY_DSN) {
  errorService.init({
    dsn: env.UNIVERSE_PUBLIC_SENTRY_DSN,
    environment: env.STAGE,
    version: `${__APP_NAME__}@${__VERSION__}`,
  });
}

const root = document.getElementById('root');
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const dehydratedState = window.__REACT_QUERY_STATE__ || {};
const isDevEnv = env.STAGE === 'development';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: isDevEnv ? 0 : 3,
      refetchOnWindowFocus: !isDevEnv,
    },
  },
});
hydrate(queryClient, dehydratedState);

const app = (
  <ErrorBoundary>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Content />
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  </ErrorBoundary>
);

if (module.hot) {
  render(app, root);
  module.hot.accept();
} else {
  loadableReady(() => {
    hydrateApp(app, root);
  });
}
