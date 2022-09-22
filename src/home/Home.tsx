/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useContext, useState } from 'react';
import loadable from '@loadable/component';
import { Button, Heading, Link, Title, Theme } from '@razorpay/blade/components';
import errorService from '@razorpay/universe-cli/errorService';
import styled from 'styled-components';
import LogoLight from '../../static/razorpay-logo-light.svg';
import LogoDark from '../../static/razorpay-logo-dark.svg';
import GlobalStyle from '../shared/components/GlobalStyles';
import BladeThemeTokensContext from '../shared/BladeThemeTokensContext';

// This will create a separate JS bundle
const SampleComponent = loadable(() => import('./SampleComponent'));

const MainContainer = styled.div(
  ({ theme }: { theme: Theme }) => `
  margin: ${theme.spacing[3]}px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`,
);

const Grid = styled.div(
  ({ theme }: { theme: Theme }) => `
  margin: ${theme.spacing[1]}rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
`,
);

const Card = styled.a(
  ({ theme }: { theme: Theme }) => `
    max-width: 400px;
    background-color: ${theme.colors.surface.background.level2.lowContrast};
    border-radius: ${theme.border.radius.medium}px;
    padding: ${theme.spacing[5]}px;
    display: flex;
    flex-direction: column;
    margin: ${theme.spacing[5]}px;
    text-decoration: none;
    border: 1px solid ${theme.colors.brand.primary[300]};
    transition: background-color, box-shadow, border ${theme.motion.duration.quick}ms ${theme.motion.easing.standard.effective};

    &:hover,
    &:focus,
    &:active {
      background-color: ${theme.colors.surface.background.level3.lowContrast};
      border: 1px solid ${theme.colors.brand.primary[400]};
      box-shadow: 0px 0px 30px -3px ${theme.colors.brand.primary[400]}
    }
`,
);

const Code = styled.code(
  ({ theme }: { theme: Theme }) => `
    background: ${theme.colors.surface.background.level2.lowContrast};;
    border-radius: ${theme.border.radius.medium}px;
    padding: ${theme.spacing[3]}px;
    font-size: ${theme.typography.fonts.size[300]}px;
    font-family: ${theme.typography.fonts.family.code};
    color: ${theme.colors.surface.text.normal.lowContrast};
  `,
);

const SmallPadding = styled.div(
  ({ theme }: { theme: Theme }) => `
  padding: ${theme.spacing[3]}px;
`,
);

const Footer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Home = (): JSX.Element => {
  const [crashState, setCrashState] = useState<null | { text: string }>({
    text: 'Crash the UI',
  });
  const { setTheme, theme } = useContext(BladeThemeTokensContext);

  return (
    <div>
      <GlobalStyle />
      <MainContainer>
        <Title variant="large">Welcome to Frontend Universe!</Title>
        <Grid>
          <Heading variant="large" weight="regular">
            Get started by editing
          </Heading>
          <SmallPadding />
          <Code>src/Home/Home.tsx</Code>
        </Grid>
        <Grid>
          <Card href="https://github.com/razorpay/frontend-universe/blob/master/docs/environment-variables-and-secrets.md#-environment-variables-and-secrets">
            <Heading variant="large">🔐 Env. Variables and Secrets &rarr;</Heading>
            <SmallPadding />
            <Heading variant="medium" weight="regular">
              This project have support for build time environment variables.
            </Heading>
          </Card>
          <Card href="https://github.com/razorpay/frontend-universe/blob/master/docs/customizing-projects-configs.md#-customization-of-the-project-configurations-">
            <Heading variant="large">🛠 Project Configurations &rarr;</Heading>
            <SmallPadding />
            <Heading variant="medium" weight="regular">
              You can extend and customize the project configurations as per your needs.
            </Heading>
          </Card>
          <Card href="https://github.com/razorpay/frontend-universe/blob/master/docs/getting-started-with-automated-versioning.md#automated-versioning-">
            <Heading variant="large">🔢 Automated Versioning &rarr; </Heading>
            <SmallPadding />
            <Heading variant="medium" weight="regular">
              This project comes baked in with Automated Versioning support via changesets.
            </Heading>
          </Card>
          <Card href="https://github.com/razorpay/frontend-universe/blob/master/docs/ci-cd-setup.md#cicd-setup">
            <Heading variant="large">🧰 CI/CD Setup &rarr;</Heading>
            <SmallPadding />
            <Heading variant="medium" weight="regular">
              Run workflows to automate the build and deployment process.
            </Heading>
          </Card>
          <Card href="https://github.com/razorpay/frontend-universe/blob/master/docs/error-monitoring.md#-error-monitoring">
            <Heading variant="large">🐞 Error Monitoring &rarr;</Heading>
            <SmallPadding />
            <Heading variant="medium" weight="regular">
              Universe provides error monitoring that helps you detect and track bugs and errors.
            </Heading>
          </Card>
          <Card href="https://github.com/razorpay/frontend-universe/blob/master/docs/performance-monitoring.md#performance-monitoring">
            <Heading variant="large">📈 Performance Monitoring &rarr;</Heading>
            <SmallPadding />
            <Heading variant="medium" weight="regular">
              Universe provides various capabilities to monitor the performance of your app.
            </Heading>
          </Card>
        </Grid>
        <Grid>
          <Button onClick={(): void => setCrashState(null)}>
            {
              // @ts-expect-error - Error created intentionally
              crashState.text
            }
          </Button>
          <SmallPadding />
          <Button
            variant="secondary"
            onClick={(): void => errorService.captureError('Testing errors')}
          >
            Capture an error
          </Button>
        </Grid>
        <Button
          variant="tertiary"
          onClick={(): void => setTheme(theme === 'payment' ? 'banking' : 'payment')}
        >
          {`Switch to ${theme === 'payment' ? 'banking' : 'payment'} theme`}
        </Button>
        <SampleComponent />
      </MainContainer>
      <Footer>
        <Link href="https://razorpay.com"> Powered by </Link>
        <SmallPadding />
        <img src={theme === 'payment' ? LogoLight : LogoDark} alt="RZP Logo" height={20} />
      </Footer>
    </div>
  );
};

export default Home;
