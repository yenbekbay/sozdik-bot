/* @flow */

import _ from 'lodash/fp';
import rp from 'request-promise';

import env from '../env';
import type {
  Chat,
  ParseMode,
  Message,
  InlineQueryResult,
} from './types';
import type { Logger } from '../createLogger';

type ApiMethod =
  | 'sendMessage'
  | 'sendChatAction'
  | 'answerInlineQuery'
  | 'setWebhook';
type SendMessageConfig = {
  chat: Chat,
  text: string,
  parse_mode?: ParseMode,
  disable_web_page_preview?: boolean,
  disable_notification?: boolean,
  reply_to_message_id?: number,
  reply_markup?: {
    force_reply?: boolean,
  },
};
type SendChatActionConfig = {
  chat: Chat,
  action: 'typing',
};
type AnswerInlineQueryConfig = {
  inlineQueryId: string,
  results: Array<InlineQueryResult>,
};

export type SendMessageFn = (config: SendMessageConfig) => Promise<?Message>;
export type SendChatActionFn = (config: SendChatActionConfig) => Promise<?JSON>;
export type AnswerInlineQueryFn =
  (config: AnswerInlineQueryConfig) => Promise<?JSON>;

const { telegramBotToken } = env;
const urlForTelegramApiMethod = (method: ApiMethod) =>
  `https://api.telegram.org/bot${telegramBotToken}/${method}`;

const request = rp.defaults({
  headers: { 'User-Agent': 'sozdik-bot' },
  gzip: true,
  json: true,
});
const apiRequest = (
  method: ApiMethod,
  params: Object,
): Promise<JSON> => request.post({
  url: urlForTelegramApiMethod(method),
  form: params,
});

const telegramBotApi = (logger: Logger) => ({
  sendMessage: (
    { chat, text, ...options }: SendMessageConfig,
  ) => apiRequest('sendMessage', {
    chat_id: chat.id,
    text,
    ...options,
    ..._.includes('group', chat.type) && {
      reply_markup: { force_reply: true },
    },
  }).then(
    (response: JSON) => {
      logger.debug(`Sent a message to chat ${chat.id}`);

      return ((response: any): Message);
    },
    (err: Error) => {
      logger.error(
        `Failed to send a message to chat ${chat.id}:`,
        err.message,
      );
    },
  ),
  sendChatAction: (
    { chat, action }: SendChatActionConfig,
  ) => apiRequest('sendChatAction', { chat_id: chat.id, action }).then(
    (response: JSON): JSON => {
      logger.debug(`Sent a ${action} action to chat ${chat.id}`);

      return response;
    },
    (err: Error) => {
      logger.error(
        `Failed to send a ${action} action to chat ${chat.id}:`,
        err.message,
      );
    },
  ),
  answerInlineQuery: (
    { inlineQueryId, results }: AnswerInlineQueryConfig,
  ) => apiRequest('answerInlineQuery', {
    inline_query_id: inlineQueryId,
    results: JSON.stringify(results),
  }).then(
    (response: JSON) => {
      logger.debug(`Answered inline query ${inlineQueryId}`);

      return response;
    },
    (err: Error) => {
      logger.error(
        `Failed to answer inline query ${inlineQueryId}:`,
        err.message,
      );
    },
  ),
  setWebhook: (url: string) => apiRequest('setWebhook', { url }).then(
    (response: JSON) => {
      logger.debug(`Updated telegram bot webhook url to ${url}`);

      return response;
    },
    (err: Error) => {
      logger.error(
        `Failed to update telegram webhook url to ${url}:`,
        err.message,
      );

      throw err;
    },
  ),
});

export { request, urlForTelegramApiMethod };
export default telegramBotApi;
