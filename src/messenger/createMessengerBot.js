/* @flow */

import _ from 'lodash/fp';

import createLogger from '../createLogger';
import curriedHandleMessage from './handleMessage';
import env from '../env';
import messengerPlatform from './messengerPlatform';

type WebhookCallback = {
  entry: Array<{ messaging: Array<Messaging> }>,
};

const logger = createLogger('messenger');

const createMessengerBot = () => {
  const platform = messengerPlatform(logger);
  const {
    sendTextMessage,
    sendSenderAction,
    setGreetingText,
    getUserProfile,
  } = platform;

  const handleMessage = curriedHandleMessage({
    sendTextMessage,
    sendSenderAction,
    getUserProfile,
    logger,
  });

  return {
    setGreetingText,
    verifyWebhook: (query: Object) =>
      query['hub.mode'] === 'subscribe' &&
      query['hub.verify_token'] === env.fbWebhookVerifyToken,
    handleWebhookCallback: (callback: WebhookCallback) => _.flow(
      _.flatMap('messaging'),
      _.forEach((messaging: Messaging) => {
        if (messaging.message) {
          handleMessage({
            recipientId: messaging.sender.id,
            message: messaging.message,
          });
        }
      }),
    )(callback.entry),
    __platform: platform,
    __handleMessage: handleMessage,
  };
};

export default createMessengerBot;
