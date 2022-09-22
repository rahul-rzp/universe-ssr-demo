import React, { useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import { BladeProvider } from '@razorpay/blade/components';
import { bankingTheme, paymentTheme } from '@razorpay/blade/tokens';

import { routes } from './shared/routes';
import Navbar from './shared/components/Navbar';
import Head from './shared/components/Head';
import BladeThemeTokensContext from './shared/BladeThemeTokensContext';

const App = (): React.ReactElement => {
  const { theme } = useContext(BladeThemeTokensContext);
  return (
    <BladeProvider
      themeTokens={theme === 'payment' ? paymentTheme : bankingTheme}
      colorScheme={theme === 'payment' ? 'light' : 'dark'}
    >
      <Head />
      <Navbar />
      <Routes>
        {routes.map((route) => (
          <Route key={route.path} {...route} />
        ))}
      </Routes>
    </BladeProvider>
  );
};

export default App;
