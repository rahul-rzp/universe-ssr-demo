import React, { type Dispatch } from 'react';

const BladeThemeTokensContext = React.createContext({
  theme: '',
  setTheme: (() => null) as Dispatch<string>,
});

export default BladeThemeTokensContext;
