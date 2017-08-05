/* @flow */

import _ from 'lodash/fp';
import rp from 'request-promise';

import env from '../env';
import type {
  ChatType,
  ParseModeType,
  MessageType,
  InlineQueryResultType,
} from './types';
import type {LoggerType} from '../createLogger';

type ApiMethodType =
  | 'sendMessage'
  | 'sendChatAction'
  | 'answerInlineQuery'
  | 'setWebhook';
type SendMessageConfigType = {
  chat: ChatType,
  text: string,
  parse_mode?: ParseModeType,
  disable_web_page_preview?: boolean,
  disable_notification?: boolean,
  reply_to_message_id?: number,
  reply_markup?: {
    force_reply?: boolean,
  },
};
type SendChatActionConfigType = {
  chat: ChatType,
  action: 'typing',
};
type AnswerInlineQueryConfigType = {
  inlineQueryId: string,
  results: Array<InlineQueryResultType>,
};

export type SendMessageFnType = (
  config: SendMessageConfigType,
) => Promise<?MessageType>;
export type SendChatActionFnType = (
  config: SendChatActionConfigType,
) => Promise<?{[key: string]: any}>;
export type AnswerInlineQueryFnType = (
  config: AnswerInlineQueryConfigType,
) => Promise<?{[key: string]: any}>;

const {telegramBotToken} = env;
const urlForTelegramApiMethod = (method: ApiMethodType) =>
  `https://api.telegram.org/bot${telegramBotToken}/${method}`;

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

const makeTelegramBotApi = (logger: LoggerType) => ({
  sendMessage: async ({chat, text, ...options}: SendMessageConfigType) => {
    try {
      const response: MessageType = await apiRequest('sendMessage', {
        chat_id: chat.id,
        text,
        ...options,
        ...(_.includes('group', chat.type) && {
          reply_markup: {force_reply: true},
        }),
      });

      logger.debug(`Sent a message to chat ${chat.id}`);

      return response;
    } catch (err) {
      logger.error(`Failed to send a message to chat ${chat.id}:`, err.message);

      return null;
    }
  },
  sendChatAction: async ({chat, action}: SendChatActionConfigType) => {
    try {
      const response = await apiRequest('sendChatAction', {
        chat_id: chat.id,
        action,
      });

      logger.debug(`Sent a ${action} action to chat ${chat.id}`);

      return response;
    } catch (err) {
      logger.error(
        `Failed to send a ${action} action to chat ${chat.id}:`,
        err.message,
      );

      return null;
    }
  },
  answerInlineQuery: async ({
    inlineQueryId,
    results,
  }: AnswerInlineQueryConfigType) => {
    try {
      const response = await apiRequest('answerInlineQuery', {
        inline_query_id: inlineQueryId,
        results: JSON.stringify(results),
      });

      logger.debug(`Answered inline query ${inlineQueryId}`);

      return response;
    } catch (err) {
      logger.error(
        `Failed to answer inline query ${inlineQueryId}:`,
        err.message,
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
        `Failed to update telegram webhook url to ${url}:`,
        err.message,
      );

      throw err;
    }
  },
});

export {request, urlForTelegramApiMethod};
export default makeTelegramBotApi;
