/* @flow */

import _ from 'lodash/fp';

import makeLogger from 'src/makeLogger';
import config from 'src/config';
import getSozdikApi from 'src/getSozdikApi';

import makeHandleMessage from './makeHandleMessage';
import makeMessengerPlatform from './makeMessengerPlatform';
import type {MessagingType} from './types';

type WebhookCallbackType = {
  entry: Array<{messaging: Array<MessagingType>}>,
};

const {getTranslationsForQuery} = getSozdikApi('facebook');
const logger = makeLogger('messenger');

const createMessengerBot = () => {
  const platform = makeMessengerPlatform(logger);
  const {
    sendTextMessage,
    sendSenderAction,
    setGreetingText,
    getUserProfile,
  } = platform;

  const handleMessage = makeHandleMessage({
    sendTextMessage,
    sendSenderAction,
    getUserProfile,
    getTranslationsForQuery,
    logger,
  });

  return {
    verifyWebhook: (query: {[key: string]: any}) =>
      query['hub.mode'] === 'subscribe' &&
      query['hub.verify_token'] === config.fbWebhookVerifyToken,
    handleWebhookCallback: (callback: WebhookCallbackType) =>
      _.flow(
        _.flatMap('messaging'),
        // $FlowFixMe
        _.forEach((messaging: MessagingType) => {
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
