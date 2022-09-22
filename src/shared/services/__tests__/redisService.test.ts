import * as redisService from '../redisService';
import packageJSON from '../../../../package.json';

let mockRedis: Record<string, string> = {};

jest.mock('ioredis', () => {
  class Redis {
    status = 'ready';
    get(key: string): Promise<string> {
      return new Promise((resolve) => {
        if (key.includes('trigger-error')) {
          throw new Error('Unexpected Redis Error');
        }
        resolve(mockRedis[key]);
      });
    }
    set(key: string, val: string): Promise<'OK'> {
      return new Promise((resolve) => {
        if (key.includes('trigger-error')) {
          throw new Error('Unexpected Redis Error');
        }
        if (key.includes('set-mock-status')) {
          // Has nothing to do with storing page to cache.
          // Hack to set mocked status :(
          this.status = val;
          resolve('OK');
        }
        mockRedis[key] = val;
        resolve('OK');
      });
    }
    del(key: string): Promise<number> {
      return new Promise((resolve) => {
        delete mockRedis[key];
        resolve(1);
      });
    }
    exists(key: string): Promise<number> {
      return new Promise((resolve) => {
        if (key.includes('trigger-error')) {
          throw new Error('Unexpected Redis Error');
        }
        if (key in mockRedis) {
          resolve(1);
        } else {
          resolve(0);
        }
      });
    }
  }

  return Redis;
});

afterEach(() => {
  mockRedis = {};
});

describe('createCachePageKey()', () => {
  const cachePrefix = `${packageJSON.name}:page:`;

  test('should prepend cache identifier prefix', () => {
    expect(
      redisService.createCachePageKey({
        route: '/',
      }),
    ).toBe(`${cachePrefix}/`);
    expect(
      redisService.createCachePageKey({
        route: '/about',
      }),
    ).toBe(`${cachePrefix}/about`);
  });
});

describe('setPageInCache()', () => {
  test('should fail gracefully on error and return null', async () => {
    expect(await redisService.storePageInCache('/trigger-error', 'test')).toBe(null);
  });
});

describe('getPageFromCache()', () => {
  test('should return a value of particular page', async () => {
    await redisService.storePageInCache('/about', 'test-about-page');
    expect(await redisService.getPageFromCache('/about')).toBe('test-about-page');
  });

  test('should fail gracefully on error and return null', async () => {
    expect(await redisService.getPageFromCache('/trigger-error')).toBe(null);
  });
});

describe('isPageCached()', () => {
  test('should expect isPageCached to be true when page added', async () => {
    expect(await redisService.isPageCached('/')).toBe(false);
    await redisService.storePageInCache('/', 'test-homepage');
    expect(await redisService.isPageCached('/')).toBe(true);
  });

  test('should fail gracefully on error and return false', async () => {
    // adding cache key manually to make sure the `false` is not due to key not existing
    mockRedis['/trigger-error'] = 'existing cache key';
    expect(await redisService.isPageCached('/trigger-error')).toBe(false);
  });

  test('should return false if redis status is not ready', async () => {
    await redisService.storePageInCache('/', 'test-homepage');
    expect(await redisService.isPageCached('/')).toBe(true);
    await redisService.storePageInCache('set-mock-status', 'reconnecting');
    expect(await redisService.isPageCached('/')).toBe(false);
    await redisService.storePageInCache('set-mock-status', 'ready');
    expect(await redisService.isPageCached('/')).toBe(true);
  });
});
