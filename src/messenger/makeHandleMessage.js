/* @flow */

import _ from 'lodash/fp';
import removeMarkdown from 'remove-markdown';

import {trackUser, trackEvent} from 'src/analytics';
import config from 'src/config';
import type {LoggerType} from 'src/makeLogger';
import type {
  TranslationType,
  GetTranslationForQueryFnType,
} from 'src/getSozdikApi';

import type {
  SendTextMessageFnType,
  SendSenderActionFnType,
  GetUserProfileFnType,
} from './makeMessengerPlatform';
import type {MessageType} from './types';

const makeHandleMessage = ({
  sendTextMessage,
  sendSenderAction,
  getUserProfile,
  getTranslationsForQuery,
  logger,
}: {|
  sendTextMessage: SendTextMessageFnType,
  sendSenderAction: SendSenderActionFnType,
  getUserProfile: GetUserProfileFnType,
  getTranslationsForQuery: GetTranslationForQueryFnType,
  logger: LoggerType,
|}) => async ({
  recipientId,
  message: {text},
}: {|
  recipientId: string,
  message: MessageType,
|}) => {
  if (!text || text.length === 0) return null;

  try {
    const [user, translations] = await Promise.all([
      getUserProfile(recipientId),
      getTranslationsForQuery(text.toLowerCase()),
      sendSenderAction({recipientId, action: 'typing_on'}),
    ]);

    const userInfo = {
      id: recipientId,
      ...(user ? _.pick(['first_name', 'last_name'], user) : {}),
    };

    logger.info(
      `Translating "${text.toLowerCase()}" for user`,
      JSON.stringify(userInfo),
    );

    await Promise.all([
      trackUser({id: recipientId, ...user}),
      trackEvent(recipientId, 'Requested translations', {
        query: text,
        kk_translation: !!_.find({toLang: 'kk'}, translations),
        ru_translation: !!_.find({toLang: 'ru'}, translations),
      }),
    ]);

    return translations.length
      ? await Promise.all(
          _.map(
            (translation: TranslationType) =>
              sendTextMessage({
                recipientId,
                text: _.truncate(
                  {length: 320, omission: `...\n${translation.url}`},
                  (removeMarkdown(
                    `${translation.title}:\n${translation.text}`,
                  ): string),
                ),
              }),
            translations,
          ),
        )
      : await sendTextMessage({
          recipientId,
          text: config.noTranslationsFoundText,
        });
  } catch (err) {
    logger.error(
      `Failed to reply to a message from user ${recipientId}: ${err.message}`,
    );

    return sendTextMessage({recipientId, text: config.errorText});
  }
};

export default makeHandleMessage;
