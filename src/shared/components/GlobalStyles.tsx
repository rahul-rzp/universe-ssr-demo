import { createGlobalStyle } from 'styled-components';
import { Theme } from '@razorpay/blade/components';

const GlobalStyle = createGlobalStyle`
  body {
    background-color: ${({ theme }: { theme: Theme }): string =>
      theme.colors.surface.background.level1.lowContrast}
  }
`;

export default GlobalStyle;
