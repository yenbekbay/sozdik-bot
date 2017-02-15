/* @flow */

import _ from 'lodash/fp';

import createLogger from '../createLogger';
import curriedHandleMessage from './handleMessage';
import env from '../env';
import messengerPlatform from './messengerPlatform';
import sozdikApi from '../sozdikApi';
import type {Messaging} from './types';

type WebhookCallback = {
  entry: Array<{messaging: Array<Messaging>}>,
};

const {fbWebhookVerifyToken} = env;
const {getTranslationsForQuery} = sozdikApi('facebook');
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
    getTranslationsForQuery,
    logger,
  });

  return {
    verifyWebhook: (query: Object) =>
      query['hub.mode'] === 'subscribe' &&
        query['hub.verify_token'] === fbWebhookVerifyToken,
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
    setUp: () => {
      setGreetingText('Просто введи слово, фразу или число, и я переведу.');
    },
    __platform: platform,
    __handleMessage: handleMessage,
  };
};

export default createMessengerBot;
