import Redis from 'ioredis';
import packageJSON from '../../../package.json';
import { routes } from '../routes';
import env from '../../env';

const isDevEnvironment = __STAGE__ === 'development';

const redis = new Redis({
  port: env.REDIS_PORT,
  host: env.REDIS_HOST,
  password: env.REDIS_PASSWORD,
  db: env.REDIS_DB,
  // Number of response-blocking retries before falling back to no connection
  maxRetriesPerRequest: 0,
  retryStrategy: (times): number | null => {
    if (isDevEnvironment) {
      if (times < 2) {
        return 2000; // reconnect after 2 seconds
      }

      return null; // stop retrying
    }

    // In environments other than `development`,
    // Keep retrying, on increasing intervals till 2 seconds (Redis Default)
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

const HOUR = 60 * 60;
const DEFAULT_CACHE_EXPIRY_TIME_SECONDS = 1 * HOUR; // In seconds.

type REDIS_STATUS_OK = 'OK';

type CacheIdentifierProps = {
  route: string;
};
const createCachePageKey = ({ route }: CacheIdentifierProps): string => {
  return `${packageJSON.name}:page:${route}`;
};

const storePageInCache = async (
  route: string,
  value: Redis.ValueType,
): Promise<REDIS_STATUS_OK | null> => {
  const routeLevelExpiry = routes.find(
    (definedRoute) =>
      createCachePageKey({
        route: definedRoute.path,
      }) ===
      createCachePageKey({
        route,
      }),
  );
  // Priority order:
  // route level expiry defined in routes.ts > default expiry time
  const pageExpiryTimeSeconds: number =
    routeLevelExpiry?.cacheExpirySeconds ?? DEFAULT_CACHE_EXPIRY_TIME_SECONDS;

  try {
    return await redis.set(
      createCachePageKey({
        route,
      }),
      value,
      'EX',
      pageExpiryTimeSeconds,
    );
  } catch (err) {
    if (!isDevEnvironment) {
      console.error('[redis]: ', (err as Error).message);
    }
    return Promise.resolve(null);
  }
};

const isPageCached = async (route: string): Promise<boolean> => {
  // If redis is not connected, we return false.
  // This helps us avoid the delay of failure on 'redis.exists()' function.
  if (redis.status !== 'ready') {
    return false;
  }
  try {
    if (
      await redis.exists(
        createCachePageKey({
          route,
        }),
      )
    ) {
      return true;
    }
    return false;
  } catch (err) {
    if (!isDevEnvironment) {
      console.error('[redis]: ', (err as Error).message);
    }
    return false;
  }
};

const getPageFromCache = async (route: string): Promise<string | null> => {
  try {
    return await redis.get(
      createCachePageKey({
        route,
      }),
    );
  } catch (err) {
    if (!isDevEnvironment) {
      console.error('[redis]: ', (err as Error).message);
    }
    return Promise.resolve(null);
  }
};

export { createCachePageKey, isPageCached, storePageInCache, getPageFromCache };
