import React, { useState } from 'react';
import BladeThemeTokensContext from './shared/BladeThemeTokensContext';
import App from './app';

const Content = (): React.ReactElement => {
  const [theme, setTheme] = useState<string>('payment');
  return (
    <BladeThemeTokensContext.Provider
      value={{
        theme,
        setTheme,
      }}
    >
      <App key={theme} />
    </BladeThemeTokensContext.Provider>
  );
};

export default Content;
