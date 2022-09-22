// eslint-disable-next-line import/no-extraneous-dependencies
import { NextFunction, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';

type IdentityMiddleware = () => (req: Request, res: Response, next: NextFunction) => void;

// `ajs_anonymous_id` cookie is eventually used by segment for identifying non-logged in users
const SEGMENT_ANONYMOUS_COOKIE_KEY = 'ajs_anonymous_id';
// used for identifying A/B variant for particular user
const AB_USER_COOKIE_KEY = 'ab_user_id';

const identityMiddleware: IdentityMiddleware =
  () =>
  (req, res, next): void => {
    // Set Segment Anonymous Cookie
    let ajsAnonymousId: string = req.cookies[SEGMENT_ANONYMOUS_COOKIE_KEY];
    if (!ajsAnonymousId) {
      ajsAnonymousId = uuid();
      /**
       *
       * Why double quotes around value?
       *
       * 1. Segment needs cookie values in ""xyz"" format instead of "xyz"
       * Resource: https://github.com/segmentio/analytics.js/issues/429#issuecomment-584887783
       * 2. They use JSON.stringify for handling falsy types (JSON.stringify("xyz") outputs ""xyz"")
       * Resource: https://segment.com/docs/connections/sources/catalog/libraries/website/javascript/troubleshooting/#how-are-properties-with-null-and-undefined-values-treated
       *
       */

      res.cookie(SEGMENT_ANONYMOUS_COOKIE_KEY, JSON.stringify(ajsAnonymousId));
    }

    try {
      // JSON.parse(""xyz"") outputs "xyz"
      res.locals.ajsAnonymousId = JSON.parse(ajsAnonymousId);
    } catch (err) {
      res.locals.ajsAnonymousId = ajsAnonymousId;
    }

    // Set AB User Cookie
    let abUserId: string = req.cookies[AB_USER_COOKIE_KEY];
    if (!abUserId) {
      abUserId = res.locals.ajsAnonymousId;
      res.cookie(AB_USER_COOKIE_KEY, JSON.stringify(abUserId));
    }

    try {
      res.locals.abUserId = JSON.parse(abUserId);
    } catch (err) {
      res.locals.abUserId = abUserId;
    }

    next();
  };

export default identityMiddleware;
