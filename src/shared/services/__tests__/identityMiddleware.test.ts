import identityMiddleware from '../identityMiddleware';

const SEGMENT_ANONYMOUS_COOKIE_KEY = 'ajs_anonymous_id';
const AB_USER_COOKIE_KEY = 'ab_user_id';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = (): void => {};

describe('identityMiddleware()', () => {
  let next = noop;
  const req: any = {
    cookies: {},
  };
  const res: any = {
    cookie: (key: string, val: string) => {
      req.cookies[key] = val;
    },
    locals: {},
  };

  afterEach(() => {
    req.cookies = {};
    res.locals = {};
  });

  test('should set segment and ab cookie', () => {
    identityMiddleware()(req, res, next);
    expect(req.cookies).toHaveProperty(SEGMENT_ANONYMOUS_COOKIE_KEY);
    expect(req.cookies).toHaveProperty(AB_USER_COOKIE_KEY);
  });

  test('should have quotes around ab and segment cookie', () => {
    identityMiddleware()(req, res, next);
    const ajsAnonymousId = req.cookies[SEGMENT_ANONYMOUS_COOKIE_KEY];
    expect(ajsAnonymousId).toMatch(/^"(.*?)"$/);
    const abUserId = req.cookies[AB_USER_COOKIE_KEY];
    expect(abUserId).toMatch(/^"(.*?)"$/);
  });

  test('cookies should have same values', () => {
    identityMiddleware()(req, res, next);
    const ajsAnonymousId = req.cookies[SEGMENT_ANONYMOUS_COOKIE_KEY];
    const abUserId = req.cookies[AB_USER_COOKIE_KEY];
    expect(ajsAnonymousId).toBe(abUserId);
  });

  test('should add cookies to res.locals', () => {
    identityMiddleware()(req, res, next);
    expect(res.locals).toHaveProperty('ajsAnonymousId');
    expect(res.locals).toHaveProperty('abUserId');
    expect(res.locals.abUserId).toBe(res.locals.ajsAnonymousId);
  });

  test('should call next middleware', () => {
    next = jest.fn(noop);
    identityMiddleware()(req, res, next);
    expect(next).toBeCalledTimes(1);
  });
});
