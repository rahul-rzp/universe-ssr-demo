import { PlaywrightTestConfig } from '@playwright/test';
import universePlaywrightConfig from '@razorpay/universe-test/src/configs/e2e.web/playwright.config';

const basePlaywrightConfig = universePlaywrightConfig as PlaywrightTestConfig;

const config: PlaywrightTestConfig = {
  ...basePlaywrightConfig,
};

export default config;
