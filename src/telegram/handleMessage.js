/* @flow */

import _ from 'lodash/fp';

import Analytics from 'src/services/Analytics';
import config from 'src/config';
import getSozdikApi from 'src/services/getSozdikApi';
import makeLogger from 'src/utils/makeLogger';
import TelegramBotApi from 'src/services/TelegramBotApi';
import type {TelegramMessageType} from 'src/services/TelegramBotApi';
import type {TranslationType} from 'src/services/getSozdikApi';

const logger = makeLogger('telegram/handleMessage');
const sozdikApi = getSozdikApi('telegram');

/* eslint-disable max-statements */
const handleMessage = async ({text, from: user, chat}: TelegramMessageType) => {
  if (text === null || text === undefined || text.length === 0) return null;

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

        const [message] = await Promise.all([
          TelegramBotApi.sendMessage({
            chat,
            text: config.telegramStartText,
            parse_mode: 'Markdown',
            disable_web_page_preview: true,
          }),
          Analytics.trackUser(user),
          Analytics.trackEvent(user.id, 'Requested the start message'),
        ]);

        return message;
      }
      case '/help': {
        logger.info(
          `Sending the help message for chat ${JSON.stringify(chatInfo)}`,
        );

        const [message] = await Promise.all([
          TelegramBotApi.sendMessage({
            chat,
            text: config.telegramHelpText,
            parse_mode: 'Markdown',
          }),
          Analytics.trackUser(user),
          Analytics.trackEvent(user.id, 'Requested the help message'),
        ]);

        return message;
      }
      default: {
        logger.info(
          `Translating "${text.toLowerCase()}" for chat ${JSON.stringify(
            chatInfo,
          )}`,
        );

        const [translations] = await Promise.all([
          sozdikApi.getTranslationsForQuery(text.toLowerCase()),
          TelegramBotApi.sendChatAction({chat, action: 'typing'}),
        ]);

        await Promise.all([
          Analytics.trackUser(user),
          Analytics.trackEvent(user.id, 'Requested translations', {
            query: text,
            kk_translation: !!_.find({toLang: 'kk'}, translations),
            ru_translation: !!_.find({toLang: 'ru'}, translations),
          }),
        ]);

        if (translations.length > 0) {
          return await Promise.all(
            _.map(
              (translation: TranslationType) =>
                TelegramBotApi.sendMessage({
                  chat,
                  text: `${translation.title}:\n${translation.text}`,
                  parse_mode: 'Markdown',
                  disable_web_page_preview: true,
                }),
              translations,
            ),
          );
        }

        return await TelegramBotApi.sendMessage({
          chat,
          text: config.noTranslationsFoundText,
        });
      }
    }
  } catch (err) {
    logger.error(
      `Failed to reply to a message in chat ${JSON.stringify(
        chatInfo,
      )}: ${err.message}`,
    );

    return TelegramBotApi.sendMessage({chat, text: config.errorText});
  }
};
/* eslint-enable max-statements */

export default handleMessage;
export {logger as __logger};
