/* @flow */

import createLogger from '../createLogger';
import curriedHandleInlineQuery from './handleInlineQuery';
import curriedHandleMessage from './handleMessage';
import telegramBotApi from './telegramBotApi';
import type {
  Message,
  InlineQuery,
} from './types';

type Update = {
  message?: Message,
  inline_query?: InlineQuery,
};

const logger = createLogger('telegram');

const createTelegramBot = () => {
  const botApi = telegramBotApi(logger);
  const {
    sendMessage,
    sendChatAction,
    answerInlineQuery,
    setWebhook,
  } = botApi;

  const handleMessage = curriedHandleMessage({
    sendMessage,
    sendChatAction,
    logger,
  });
  const handleInlineQuery = curriedHandleInlineQuery({
    answerInlineQuery,
    logger,
  });

  return {
    handleUpdate: (update: Update) => {
      if (update.message) {
        handleMessage(((update.message: any): Message));
      } else if (update.inline_query) {
        handleInlineQuery(((update.inline_query: any): InlineQuery));
      }
    },
    setUp: (webhookUrl: string) => setWebhook(webhookUrl),
    __botApi: botApi,
    __handleMessage: handleMessage,
    __handleInlineQuery: handleInlineQuery,
  };
};

export default createTelegramBot;
