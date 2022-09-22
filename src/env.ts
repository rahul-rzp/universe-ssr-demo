if (!__STAGE__) {
  throw new Error('Env variable not set - STAGE');
}

const UNIVERSE_PUBLIC_SENTRY_DSN = process.env.UNIVERSE_PUBLIC_SENTRY_DSN;
const UNIVERSE_PUBLIC_ASSETS_URL = process.env.UNIVERSE_PUBLIC_ASSETS_URL;
const SERVER_PORT = process.env.SERVER_PORT;
const REDIS_PORT = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : undefined;
const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
const REDIS_DB = process.env.REDIS_DB ? parseInt(process.env.REDIS_DB, 10) : undefined;
const AB_API_BASE_URL = process.env.AB_API_BASE_URL || '';

const env = {
  UNIVERSE_PUBLIC_ASSETS_URL,
  SERVER_PORT,
  REDIS_PORT,
  REDIS_HOST,
  REDIS_PASSWORD,
  REDIS_DB,
  STAGE: __STAGE__,
  UNIVERSE_PUBLIC_SENTRY_DSN,
  AB_API_BASE_URL,
};

export default env;
