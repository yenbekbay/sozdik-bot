/* @flow */

import _ from 'lodash/fp';
import Mixpanel from 'mixpanel';

import env from './env';
import createLogger from './createLogger';

const logger = createLogger('analytics');
const mixpanel = Mixpanel.init(env.mixpanelToken);

const trackUser = (user: {
  id: string,
  first_name?: ?string,
  last_name?: ?string,
}): Promise<any> =>
  new Promise((resolve: () => void, reject: (err: Error) => void) => {
    mixpanel.people.set(
      user.id,
      {
        $first_name: user.first_name,
        $last_name: user.last_name,
        ..._.omit(['id', 'first_name', 'last_name'], user),
      },
      (err: ?Error) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      },
    );
  }).catch((err: Error) => {
    logger.error(
      `Failed to track user ${JSON.stringify(user)} to Mixpanel:`,
      err.message,
    );
  });

const trackEvent = (
  userId: string,
  event: string,
  properties: Object = {},
): Promise<void> =>
  new Promise((resolve: () => void, reject: (err: Error) => void) => {
    mixpanel.track(event, {...properties, userId}, (err: ?Error) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  }).catch((err: Error) => {
    logger.error(
      `Failed to track event ${event} for user ${userId} to Mixpanel:`,
      err.message,
    );
  });

export {trackUser, trackEvent, logger as __logger, mixpanel as __mixpanel};
