/* @flow */

import TelegramBotApi from 'src/services/TelegramBotApi';
import type {TelegramUpdateType} from 'src/services/TelegramBotApi';

import handleInlineQuery from './handleInlineQuery';
import handleMessage from './handleMessage';

const telegramBot = {
  handleUpdate: (update: TelegramUpdateType) => {
    if (update.message) {
      handleMessage(update.message);
    } else if (update.inline_query) {
      handleInlineQuery(update.inline_query);
    }
  },
  setUp: (webhookUrl: string) => TelegramBotApi.setWebhook(webhookUrl),
};

export default telegramBot;
