/* @flow */

import _ from 'lodash';
import Mixpanel from 'mixpanel';

import env from './env';
import getLogger from './getLogger';

const logger = getLogger(['analytics']);
const mixpanel = Mixpanel.init(
  env.mixpanelToken,
  { debug: process.env.NODE_ENV !== 'production' },
);

export const trackUser = (user: {
  id: string,
  first_name?: ?string,
  last_name?: ?string
}): Promise<any> => new Promise((
  resolve: () => void,
  reject: (err: Error) => void,
) => {
  mixpanel.people.set(user.id, {
    $first_name: user.first_name,
    $last_name: user.last_name,
    ..._.omit(user, ['id', 'first_name', 'last_name']),
  }, (err: Error) => {
    if (err) {
      reject(err);
    } else {
      resolve();
    }
  });
})
.catch((err: Error) => {
  logger.error(
    `Failed to track user ${JSON.stringify(user)} to Mixpanel: ${err.message}`,
  );

  return;
});

export const trackEvent = (
  userId: string,
  event: string,
  properties: Object = {},
): Promise<void> => new Promise((
  resolve: () => void,
  reject: (err: Error) => void,
) => {
  mixpanel.track(
    event,
    { ...properties, userId },
    (err: Error) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    },
  );
})
.catch((err: Error) => {
  logger.error(
    `Failed to track event ${event} for user ${userId} ` +
    `to Mixpanel: ${err.message}`,
  );

  return;
});
