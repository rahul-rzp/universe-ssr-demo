import React from 'react';
import loadable, { LoadableComponent } from '@loadable/component';

// These will create separate JS bundles
const Home = loadable(() => import('../home/Home'));
const About = loadable(() => import('../about/About'));

type Route = {
  path: string;
  element: React.ReactNode;
  loadableChunk: LoadableComponent<Record<string, unknown>>;
  exact?: boolean;
  cacheExpirySeconds?: number;
  isABEnabled?: boolean;
};

type Routes = Route[];

export const paths = {
  HOME: '/',
  ABOUT: '/about',
};

const HOUR = 60 * 60;

export const routes: Routes = [
  {
    path: paths.HOME,
    element: <Home />,
    loadableChunk: Home,
    cacheExpirySeconds: 1 * HOUR,
    isABEnabled: true,
  },
  {
    path: paths.ABOUT,
    element: <About />,
    loadableChunk: About,
    cacheExpirySeconds: 24 * HOUR,
  },
];
