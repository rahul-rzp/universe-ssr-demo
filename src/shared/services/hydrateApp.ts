import { hydrate } from 'react-dom';
import { matchPath } from 'react-router-dom';
import errorService from '@razorpay/universe-cli/errorService';
import { routes } from '../routes';

const hydrateApp = (appComponent: JSX.Element, rootElement: HTMLElement | null): void => {
  try {
    const currentRoute = routes.find((route) => matchPath(location.pathname, route.path));
    if (currentRoute) {
      currentRoute.loadableChunk.load().finally(() => {
        hydrate(appComponent, rootElement);
      });
    } else {
      // if no matching route found, hydrate anyway
      hydrate(appComponent, rootElement);
    }
  } catch (err) {
    console.error('error: hydrateApp', err);
    errorService.captureError(`[hydrateApp]: ${(err as Error).message}`, {
      rank: errorService.ErrorRank.P1,
      tags: {},
    });
    hydrate(appComponent, rootElement);
  }
};

export default hydrateApp;
