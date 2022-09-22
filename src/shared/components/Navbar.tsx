import React from 'react';
import { Link, Text, Theme } from '@razorpay/blade/components';
import styled from 'styled-components';

import { paths } from '../routes';

const Flex = styled.nav`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Padding = styled.div(
  ({ theme }: { theme: Theme }) => `
  padding: ${theme.spacing[3]}px;
`,
);

const Navbar = (): JSX.Element => (
  <Flex>
    <Link href={paths.HOME}>Home</Link>
    <Padding />
    <Text>{' • '}</Text>
    <Padding />
    <Link href={paths.ABOUT}>About</Link>
  </Flex>
);

export default Navbar;
