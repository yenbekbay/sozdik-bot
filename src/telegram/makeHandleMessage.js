/* @flow */

import _ from 'lodash/fp';

import {trackUser, trackEvent} from '../analytics';
import env from '../env';
import type {LoggerType} from '../createLogger';
import type {MessageType} from './types';
import type {
  SendMessageFnType,
  SendChatActionFnType,
} from './makeTelegramBotApi';
import type {TranslationType, GetTranslationForQueryFnType} from '../sozdikApi';

const {helpText, startText, noTranslationsFoundText, errorText} = env;

/* eslint-disable max-statements */
const makeHandleMessage = ({
  sendMessage,
  sendChatAction,
  getTranslationsForQuery,
  logger,
}: {
  sendMessage: SendMessageFnType,
  sendChatAction: SendChatActionFnType,
  getTranslationsForQuery: GetTranslationForQueryFnType,
  logger: LoggerType,
}) => async ({text, from: user, chat}: MessageType) => {
  if (text === null || text === undefined || text.length === 0) return null;

  const chatInfo = _.pick(
    ['id', 'type', 'title', 'username', 'first_name', 'last_name'],
    chat,
  );

  try {
    switch (text) {
      case '/start': {
        logger.info(
          'Sending the start message for chat',
          JSON.stringify(chatInfo),
        );

        const [message] = await Promise.all([
          sendMessage({
            chat,
            text: startText,
            parse_mode: 'Markdown',
            disable_web_page_preview: true,
          }),
          trackUser(user),
          trackEvent(user.id, 'Requested the start message'),
        ]);

        return message;
      }
      case '/help': {
        logger.info(
          'Sending the help message for chat',
          JSON.stringify(chatInfo),
        );

        const [message] = await Promise.all([
          sendMessage({
            chat,
            text: helpText,
            parse_mode: 'Markdown',
          }),
          trackUser(user),
          trackEvent(user.id, 'Requested the help message'),
        ]);

        return message;
      }
      default: {
        logger.info(
          `Translating "${text.toLowerCase()}" for chat`,
          JSON.stringify(chatInfo),
        );

        const [translations] = await Promise.all([
          getTranslationsForQuery(text.toLowerCase()),
          sendChatAction({chat, action: 'typing'}),
        ]);

        await Promise.all([
          trackUser(user),
          trackEvent(user.id, 'Requested translations', {
            query: text,
            kk_translation: !!_.find({toLang: 'kk'}, translations),
            ru_translation: !!_.find({toLang: 'ru'}, translations),
          }),
        ]);

        if (translations.length > 0) {
          return await Promise.all(
            _.map(
              (translation: TranslationType) =>
                sendMessage({
                  chat,
                  text: `${translation.title}:\n${translation.text}`,
                  parse_mode: 'Markdown',
                  disable_web_page_preview: true,
                }),
              translations,
            ),
          );
        }

        return await sendMessage({chat, text: noTranslationsFoundText});
      }
    }
  } catch (err) {
    logger.error(
      `Failed to reply to a message in chat ${chatInfo}:`,
      err.message,
    );

    return sendMessage({chat, text: errorText});
  }
};
/* eslint-enable max-statements */

export default makeHandleMessage;
