import React from 'react';
import loadable, { LoadableComponent } from '@loadable/component';
import { QueryClient } from '@tanstack/react-query';
import { fetchSlowApi, fetchUsers } from './api';

// These will create separate JS bundles
const Home = loadable(() => import('../home/Home'));
const About = loadable(() => import('../about/About'));

export type Route = {
  path: string;
  element: React.ReactNode;
  loadableChunk: LoadableComponent<Record<string, unknown>>;
  exact?: boolean;
  cacheExpirySeconds?: number;
  fetchApi?: (queryClient: QueryClient) => Promise<void>;
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
    cacheExpirySeconds: 20,
    // isABEnabled: true,
    fetchApi: (queryClient: QueryClient) => queryClient.prefetchQuery(['users'], fetchUsers),
  },
  {
    path: paths.ABOUT,
    element: <About />,
    loadableChunk: About,
    cacheExpirySeconds: 10,
    fetchApi: (queryClient: QueryClient) => queryClient.prefetchQuery(['age'], fetchSlowApi),
  },
];
