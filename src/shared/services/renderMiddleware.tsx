import path from 'path';
import React from 'react';
import ErrorBoundary from '@razorpay/universe-cli/errorService/ErrorBoundary';
// eslint-disable-next-line import/no-extraneous-dependencies
import { NextFunction, Request, Response } from 'express';
import { renderToStaticMarkup, renderToString } from 'react-dom/server';
import { ChunkExtractor } from '@loadable/server';
import { StaticRouter } from 'react-router-dom/server';
import { HelmetProvider, HelmetContext } from 'react-helmet-async';
import { ServerStyleSheet } from 'styled-components';
import {
  dehydrate,
  DehydratedState,
  Hydrate,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import isEmpty from '@razorpay/universe-cli/isEmpty';
import { matchRoutes, RouteMatch } from 'react-router-dom';

import HTML from '../components/HTML';
import { Route, routes } from '../routes';
import App from '../../app';
import * as redisService from './redisService';

interface IMatchedRoute extends RouteMatch {
  route: Route;
}

// This path is resolved from build/server where the webpack bundle is created
const statsFile = path.join(__dirname, '../browser/loadable-stats.json');

const generatePage = async (requestURL: string): Promise<string> => {
  const extractor = new ChunkExtractor({
    statsFile,
  });

  const helmetContext: HelmetContext = {};
  const sheet = new ServerStyleSheet();
  const queryClient = new QueryClient();

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const matchedRoutes: IMatchedRoute[] | null = matchRoutes(routes, requestURL);
  if (matchedRoutes === null) {
    // ideally it never comes here as 404 pages would be shown
    return 'Invalid path';
  }

  const matchedRoute = matchedRoutes[0];
  if (matchedRoute.route.fetchApi) {
    await matchedRoute.route.fetchApi(queryClient);
  }

  const dehydratedState = dehydrate(queryClient);
  const app = extractor.collectChunks(
    <ErrorBoundary>
      <HelmetProvider context={helmetContext}>
        <QueryClientProvider client={queryClient}>
          <Hydrate state={dehydratedState}>
            <StaticRouter location={requestURL}>
              <App />
            </StaticRouter>
          </Hydrate>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>,
  );

  const scriptTags = [
    ...extractor.getScriptElements(),
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    generateReactQueryScriptElement(dehydratedState),
  ];
  const linkTags = extractor.getLinkElements();

  // serializing the app populates helmetContext with all head meta information
  const serializedApp = renderToString(sheet.collectStyles(app));

  const styleTags = sheet.getStyleElement();

  return `<!doctype html>
  ${renderToStaticMarkup(
    // eslint-disable-next-line react/jsx-pascal-case
    <HTML
      scriptTags={scriptTags}
      linkTags={linkTags}
      styleTags={styleTags}
      helmetContext={helmetContext}
    >
      {serializedApp}
    </HTML>,
  )}`;
};

type ExpressMiddleware = () => (req: Request, res: Response, next: NextFunction) => void;

const renderMiddleware: ExpressMiddleware =
  () =>
  async (req, res): Promise<void> => {
    let serverResponse: string | null;
    // TODO: disable redis cache during development
    // eslint-disable-next-line no-constant-condition
    if ((await redisService.isPageCached(req.path)) && false) {
      console.log('cache hit');
      // Cache Hit
      serverResponse = await redisService.getPageFromCache(req.path);
      if (isEmpty(serverResponse)) {
        // if error, return page from server
        serverResponse = await generatePage(req.path);
      }
    } else {
      // Server Hit
      console.log('server hit');
      serverResponse = await generatePage(req.path);
      redisService.storePageInCache(req.path, serverResponse);
    }

    res.send(serverResponse);
  };

function generateReactQueryScriptElement(dehydratedState: DehydratedState): JSX.Element {
  return (
    <script
      key="react-query"
      dangerouslySetInnerHTML={{
        __html: `window.__REACT_QUERY_STATE__ = ${JSON.stringify(dehydratedState)};`,
      }}
    />
  );
}

export default renderMiddleware;
