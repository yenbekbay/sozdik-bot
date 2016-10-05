/* @flow */

import _ from 'lodash/fp';

import { getTranslationsForQuery } from '../sozdikApi';
import { trackUser, trackEvent } from '../analytics';
import env from '../env';
import type { Logger } from '../createLogger';
import type { Message } from './types';
import type { SendMessageFn, SendChatActionFn } from './telegramBotApi';
import type { Translation } from '../sozdikApi';

const { helpText, startText, noTranslationsFoundText, errorText } = env;

const handleMessage = (
  { sendMessage, sendChatAction, logger }: {
    sendMessage: SendMessageFn,
    sendChatAction: SendChatActionFn,
    logger: Logger,
  },
) => async (
  { text, from: user, chat }: Message,
): Promise<?(Message | Array<Message>)> => {
  if (!text || !text.length) return null;

  const chatInfo = _.pick(
    ['id', 'type', 'title', 'username', 'first_name', 'last_name'],
    chat,
  );

  try {
    switch (text) {
      case '/start': {
        logger.info(
          `Sending the start message for chat ${JSON.stringify(chatInfo)}`,
        );

        return await Promise
          .all([
            sendMessage({
              chat,
              text: startText,
              parse_mode: 'Markdown',
            }),
            trackUser(user),
            trackEvent(user.id, 'Requested the start message'),
          ])
          .then(([message]: [?Message]) => message);
      }
      case '/help': {
        logger.info(
          `Sending the help message for chat ${JSON.stringify(chatInfo)}`,
        );

        return await Promise
          .all([
            sendMessage({
              chat,
              text: helpText,
              parse_mode: 'Markdown',
            }),
            trackUser(user),
            trackEvent(user.id, 'Requested the help message'),
          ])
          .then(([message]: [?Message]) => message);
      }
      default: {
        const [translations] = await Promise.all([
          getTranslationsForQuery(text.toLowerCase()),
          sendChatAction({ chat, action: 'typing' }),
        ]);

        await Promise.all([
          trackUser(user),
          trackEvent(user.id, 'Requested translations', {
            query: text,
            kk_translation: !!_.find({ toLang: 'kk' }, translations),
            ru_translation: !!_.find({ toLang: 'ru' }, translations),
          }),
        ]);

        if (translations.length) {
          return await Promise.all(_.map(
            (translation: Translation) => sendMessage({
              chat,
              text: `${translation.title}:\n${translation.text}`,
              parse_mode: 'Markdown',
              disable_web_page_preview: true,
            }),
            translations,
          ));
        }

        return await sendMessage({ chat, text: noTranslationsFoundText });
      }
    }
  } catch (err) {
    logger.error(
      `Failed to reply to a message in chat ${chatInfo}:`,
      err.message,
    );

    return await sendMessage({ chat, text: errorText });
  }
};

export default handleMessage;
