import path from 'path';
import React from 'react';
import ErrorBoundary from '@razorpay/universe-cli/errorService/ErrorBoundary';
// eslint-disable-next-line import/no-extraneous-dependencies
import { NextFunction, Request, Response } from 'express';
import { renderToStaticMarkup, renderToString } from 'react-dom/server';
import { ChunkExtractor } from '@loadable/server';
import { StaticRouter } from 'react-router-dom/server';
import { HelmetProvider, HelmetContext } from 'react-helmet-async';
import isEmpty from '@razorpay/universe-cli/isEmpty';

import HTML from '../components/HTML';
import App from '../../app';
import * as redisService from './redisService';

// This path is resolved from build/server where the webpack bundle is created
const statsFile = path.join(__dirname, '../browser/loadable-stats.json');

const generatePage = (requestURL: string): string => {
  const extractor = new ChunkExtractor({
    statsFile,
  });

  const helmetContext: HelmetContext = {};
  const app = extractor.collectChunks(
    <ErrorBoundary>
      <HelmetProvider context={helmetContext}>
        <StaticRouter location={requestURL}>
          <App />
        </StaticRouter>
      </HelmetProvider>
    </ErrorBoundary>,
  );
  const scriptTags = extractor.getScriptElements();
  const linkTags = extractor.getLinkElements();
  const styleTags = extractor.getStyleElements();

  // serializing the app populates helmetContext with all head meta information
  const serializedApp = renderToString(app);

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
    if (await redisService.isPageCached(req.path)) {
      // Cache Hit
      serverResponse = await redisService.getPageFromCache(req.path);
      if (isEmpty(serverResponse)) {
        // if error, return page from server
        serverResponse = generatePage(req.path);
      }
    } else {
      // Server Hit
      serverResponse = generatePage(req.path);
      redisService.storePageInCache(req.path, serverResponse);
    }

    res.send(serverResponse);
  };

export default renderMiddleware;
