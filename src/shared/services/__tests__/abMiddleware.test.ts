import { ABVariant } from '@razorpay/universe-cli/ab';

import abMiddleware from '../abMiddleware';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = (): void => {};

const mockAbInit = jest.fn();
const mockAbGetVariant = jest.fn();
jest.mock('@razorpay/universe-cli/ab', () => {
  function init(abConfig: any): void {
    mockAbInit(abConfig);
  }
  function getVariant(options: any): ABVariant {
    mockAbGetVariant(options.id);
    return {
      name: 'variant-a',
      variables: [
        {
          key: 'result',
          value: 'on',
        },
      ],
    };
  }

  return {
    getVariant,
    init,
  };
});

jest.mock('../../routes.tsx', () => {
  const routes = [
    {
      path: '/ab-enabled-route',
      isABEnabled: true,
    },
    {
      path: '/ab-disabled-route',
      isABEnabled: false,
    },
  ];

  return { routes };
});

describe('abMiddleware()', () => {
  let next = noop;
  const req: any = {
    url: '',
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
    req.url = '';
    res.locals = {};
    mockAbInit.mockReset();
    mockAbGetVariant.mockReset();
  });

  test('should call abService.init with id and apiBaseUrl', () => {
    res.locals = {
      abUserId: 'trigger-variant-b',
    };
    abMiddleware()(req, res, next);
    expect(mockAbInit).toBeCalledWith({
      apiBaseUrl: 'https://beta-api.stage.razorpay.in',
    });
  });

  test('should call getVariant and use id from init', () => {
    res.locals = {
      abUserId: 'test-id-123',
    };
    req.url = '/ab-enabled-route';
    abMiddleware()(req, res, next);
    expect(mockAbGetVariant).toBeCalledWith('test-id-123');
  });

  test('should not call getVariant if ab not enabled in route', () => {
    res.locals = {
      abUserId: 'test-id-123',
    };
    req.url = '/ab-disabled-route';
    abMiddleware()(req, res, next);
    expect(mockAbGetVariant).not.toBeCalled();
  });

  test('should call next middleware', () => {
    next = jest.fn(noop);
    abMiddleware()(req, res, next);
    expect(next).toBeCalledTimes(1);
  });
});
