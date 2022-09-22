// eslint-disable-next-line import/no-extraneous-dependencies
import { NextFunction, Request, Response } from 'express';
import abService, { ABVariant } from '@razorpay/universe-cli/ab';
import { routes } from '../routes';
import abExperimentIdMap from '../abExperimentIdMap';
import env from '../../env';

type ABMiddleware = () => (req: Request, res: Response, next: NextFunction) => void;

const abMiddleware: ABMiddleware =
  () =>
  async (req, res, next): Promise<void> => {
    abService.init({
      apiBaseUrl: env.AB_API_BASE_URL,
    });

    // Check if AB is enabled for current route.
    const isABEnabledForCurrentRoute = routes.find(
      (route) => route.path === req.url && route.isABEnabled,
    );

    if (isABEnabledForCurrentRoute) {
      const defaultVariant: ABVariant = {
        name: 'variant-a',
        variables: [
          {
            key: 'result',
            value: 'on',
          },
        ],
      };

      const abResponse = await abService.getVariant(
        {
          experimentId: abExperimentIdMap.EXAMPLE_AB_EXPERIMENT,
          id: res.locals.abUserId,
        },
        defaultVariant,
      );

      const isResultOn =
        abResponse.variables[0]?.key === 'result' && abResponse.variables[0]?.value === 'on';

      if (abResponse.name === 'variant-b' && isResultOn) {
        // do something with variant B
      } else {
        // do something with default variant A
      }
    }

    next();
  };

export default abMiddleware;
