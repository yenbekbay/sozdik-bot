/* @flow */

import _ from 'lodash/fp';
import Mixpanel from 'mixpanel';

import config from 'src/config';
import makeLogger from 'src/makeLogger';

const logger = makeLogger('analytics');
const mixpanel = Mixpanel.init(config.mixpanelToken);

const trackUser = async (user: {
  id: string,
  first_name?: ?string,
  last_name?: ?string,
}) => {
  try {
    await new Promise((resolve, reject) => {
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
    });
  } catch (err) {
    logger.error(
      `Failed to track user ${JSON.stringify(
        user,
      )} to Mixpanel: ${err.message}`,
    );
  }
};

const trackEvent = async (
  userId: string,
  event: string,
  properties: {[key: string]: any} = {},
) => {
  try {
    await new Promise((resolve, reject) => {
      mixpanel.track(event, {...properties, userId}, (err: ?Error) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  } catch (err) {
    logger.error(
      `Failed to track event ${event} for user ${userId} to Mixpanel: ${err.message}`,
    );
  }
};

export {trackUser, trackEvent, logger as __logger, mixpanel as __mixpanel};
