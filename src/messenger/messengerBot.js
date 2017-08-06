/* @flow */

import _ from 'lodash/fp';

import config from 'src/config';
import MessengerPlatform from 'src/services/MessengerPlatform';
import type {
  MessengerMessagingType,
  MessengerWebhookCallbackType,
} from 'src/services/MessengerPlatform';

import handleMessage from './handleMessage';

const messengerBot = {
  verifyWebhook: (query: {[key: string]: any}) =>
    query['hub.mode'] === 'subscribe' &&
    query['hub.verify_token'] === config.fbWebhookVerifyToken,
  handleWebhookCallback: (callback: MessengerWebhookCallbackType) =>
    _.flow(
      _.flatMap(entryItem => entryItem.messaging),
      // $FlowFixMe
      _.forEach((messaging: MessengerMessagingType) => {
        if (messaging.message) {
          handleMessage({
            recipientId: messaging.sender.id,
            message: messaging.message,
          });
        }
      }),
    )(callback.entry),
  setUp: () => {
    MessengerPlatform.setGreetingText(config.messengerGreetingText);
  },
};

export default messengerBot;
