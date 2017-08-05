/* @flow */

import _ from 'lodash/fp';
import rp from 'request-promise';

import config from 'src/config';
import makeLogger from 'src/utils/makeLogger';

type TelegramUserType = {
  id: string,
  first_name?: ?string,
  last_name?: ?string,
  username?: string,
};
type TelegramChatType = {
  id: string,
  type: 'private' | 'group' | 'supergroup' | 'channel',
  title?: string,
  first_name?: string,
  last_name?: string,
  username?: string,
};
type TelegramParseModeType = 'Markdown' | 'HTML';

export type TelegramMessageType = {
  from: TelegramUserType,
  chat: TelegramChatType,
  text?: string,
};
export type TelegramInlineQueryType = {
  id: string,
  from: TelegramUserType,
  query: string,
};
export type TelegramInlineQueryResultType = {
  type: 'article',
  id: string,
  title: string,
  input_message_content: {
    message_text: string,
    parse_mode?: TelegramParseModeType,
    disable_web_page_preview?: boolean,
  },
  url?: string,
  hide_url?: boolean,
  description?: string,
  thumb_url?: string,
  thumb_width?: number,
  thumb_height?: number,
};
export type TelegramUpdateType = {
  message?: TelegramMessageType,
  inline_query?: TelegramInlineQueryType,
};

type ApiMethodType =
  | 'sendMessage'
  | 'sendChatAction'
  | 'answerInlineQuery'
  | 'setWebhook';

const TELEGRAM_API_URL = 'https://api.telegram.org';

const logger = makeLogger('telegram/TelegramBotApi');

const urlForTelegramApiMethod = (method: ApiMethodType) =>
  `${TELEGRAM_API_URL}/bot${config.telegramBotToken}/${method}`;

const request = rp.defaults({
  headers: {'User-Agent': 'sozdik-bot'},
  gzip: true,
  json: true,
});
const apiRequest = (
  method: ApiMethodType,
  params: {[key: string]: any},
): Promise<{[key: string]: any}> =>
  request.post({
    url: urlForTelegramApiMethod(method),
    form: params,
  });

const TelegramBotApi = {
  sendMessage: async ({
    chat,
    text,
    ...options
  }: {|
    chat: TelegramChatType,
    text: string,
    parse_mode?: TelegramParseModeType,
    disable_web_page_preview?: boolean,
    disable_notification?: boolean,
    reply_to_message_id?: number,
    reply_markup?: {
      force_reply?: boolean,
    },
  |}) => {
    try {
      const response: TelegramMessageType = await apiRequest('sendMessage', {
        chat_id: chat.id,
        text,
        ...options,
        ...(_.includes('group', chat.type)
          ? {
              reply_markup: {force_reply: true},
            }
          : {}),
      });

      logger.debug(`Sent a message to chat ${chat.id}`);

      return response;
    } catch (err) {
      logger.error(
        `Failed to send a message to chat ${chat.id}: ${err.message}`,
      );

      return null;
    }
  },
  sendChatAction: async ({
    chat,
    action,
  }: {|
    chat: TelegramChatType,
    action: 'typing',
  |}) => {
    try {
      const response = await apiRequest('sendChatAction', {
        chat_id: chat.id,
        action,
      });

      logger.debug(`Sent a ${action} action to chat ${chat.id}`);

      return response;
    } catch (err) {
      logger.error(
        `Failed to send a ${action} action to chat ${chat.id}: ${err.message}`,
      );

      return null;
    }
  },
  answerInlineQuery: async ({
    inlineQueryId,
    results,
  }: {|
    inlineQueryId: string,
    results: Array<TelegramInlineQueryResultType>,
  |}) => {
    try {
      const response = await apiRequest('answerInlineQuery', {
        inline_query_id: inlineQueryId,
        results: JSON.stringify(results),
      });

      logger.debug(`Answered inline query ${inlineQueryId}`);

      return response;
    } catch (err) {
      logger.error(
        `Failed to answer inline query ${inlineQueryId}: ${err.message}`,
      );

      return null;
    }
  },
  setWebhook: async (url: string) => {
    try {
      const response = await apiRequest('setWebhook', {url});

      logger.debug(`Updated telegram bot webhook url to ${url}`);

      return response;
    } catch (err) {
      logger.error(
        `Failed to update telegram webhook url to ${url}: ${err.message}`,
      );

      throw err;
    }
  },
};

export default TelegramBotApi;
export {
  logger as __logger,
  request as __request,
  urlForTelegramApiMethod as __urlForTelegramApiMethod,
};
