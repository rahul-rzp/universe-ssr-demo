import React from 'react';
import { useQuery } from '@tanstack/react-query';

import Head from '../shared/components/Head';
import { fetchSlowApi } from '../shared/api';

const About = (): JSX.Element => {
  const { data, error, isLoading } = useQuery(['age'], fetchSlowApi, {
    staleTime: 5000,
  });
  return (
    <main>
      <Head title="About" />
      <h1>About</h1>
      {isLoading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>Error occured: {JSON.stringify(error)}</div>
      ) : (
        <pre>{JSON.stringify(data, null, 4)}</pre>
      )}
    </main>
  );
};

export default About;
