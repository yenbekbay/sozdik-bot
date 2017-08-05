/* @flow */

import createLogger from 'src/createLogger';
import sozdikApi from 'src/sozdikApi';

import makeHandleInlineQuery from './makeHandleInlineQuery';
import makeHandleMessage from './makeHandleMessage';
import makeTelegramBotApi from './makeTelegramBotApi';
import type {MessageType, InlineQueryType} from './types';

type UpdateType = {
  message?: MessageType,
  inline_query?: InlineQueryType,
};

const {getTranslationsForQuery} = sozdikApi('telegram');
const logger = createLogger('telegram');

const createTelegramBot = () => {
  const botApi = makeTelegramBotApi(logger);
  const {sendMessage, sendChatAction, answerInlineQuery, setWebhook} = botApi;

  const handleMessage = makeHandleMessage({
    sendMessage,
    sendChatAction,
    getTranslationsForQuery,
    logger,
  });
  const handleInlineQuery = makeHandleInlineQuery({
    answerInlineQuery,
    getTranslationsForQuery,
    logger,
  });

  return {
    handleUpdate: (update: UpdateType) => {
      if (update.message) {
        handleMessage(update.message);
      } else if (update.inline_query) {
        handleInlineQuery(update.inline_query);
      }
    },
    setUp: (webhookUrl: string) => setWebhook(webhookUrl),
    __botApi: botApi,
    __handleMessage: handleMessage,
    __handleInlineQuery: handleInlineQuery,
  };
};

export default createTelegramBot;
