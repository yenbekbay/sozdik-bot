/* @flow */

import crypto from 'crypto';

import _ from 'lodash/fp';
import removeMarkdown from 'remove-markdown';
import TelegramBot from 'node-telegram-bot-api';

import { getTranslationsForQuery } from './sozdikApi';
import { trackUser, trackEvent } from './analytics';
import env from './env';
import getLogger from './getLogger';
import type { Translation } from './sozdikApi';

type User = {
  id: string,
  first_name?: ?string,
  last_name?: ?string,
  username?: string
};
type Chat = {
  id: string,
  type: 'private' | 'group' | 'supergroup' | 'channel',
  title?: string,
  first_name?: string,
  last_name?: string,
  username?: string
};
type ParseMode = 'Markdown' | 'HTML';
type MessageConfig = {
  chat: Chat,
  text: string,
  parse_mode?: ParseMode,
  disable_web_page_preview?: boolean,
  disable_notification?: boolean,
  reply_to_message_id?: number,
  reply_markup?: {
    force_reply?: bool
  }
};
type InlineQueryResult = {
  type: 'article',
  id: string,
  title: string,
  input_message_content: {
    message_text: string,
    parse_mode?: ParseMode,
    disable_web_page_preview?: boolean
  },
  url?: string,
  hide_url?: boolean,
  description?: string,
  thumb_url?: string,
  thumb_width?: number,
  thumb_height?: number
};
type Message = {
  message_id: number,
  from: User,
  date: number,
  chat: Chat,
  text?: string
};
type InlineQuery = {
  id: string,
  from: User,
  query: string,
  offset: string
};

const helpText = 'Просто введи слово, фразу или число, и я переведу.\n' +
  'Также я поддерживаю встроенный режим: просто набери `@SozdikBot` и любую ' +
  'фразу в поле сообщения и выбери подходящий тебе ответ.';

const logger = getLogger(['telegram']);
const bot = new TelegramBot(env.telegramBotToken, { polling: true });

const sendMessage = (
  { chat, text, ...options }: MessageConfig,
): Promise<void> => bot
  .sendMessage(chat.id, text, {
    ...options,
    ..._.includes('group')(chat.type) && {
      reply_markup: { force_reply: true },
    },
  })
  .then(
    () => {
      logger.debug(`Sent a message to chat ${chat.id}`);

      return;
    },
    (err: Error) => {
      logger.error(
        `Failed to send a message to chat ${chat.id}: ${err.message}`,
      );

      return;
    },
  );
const sendChatAction = (
  chatId: string,
  action: 'typing',
): Promise<void> => bot
  .sendChatAction(chatId, action)
  .then(
    () => {
      logger.debug(`Sent a ${action} action to chat ${chatId}`);

      return;
    },
    (err: Error) => {
      logger.error(
        `Failed to send a ${action} action to chat ${chatId}: ${err.message}`,
      );

      return;
    },
  );
const answerInlineQuery = (
  inlineQueryId: string,
  results: Array<InlineQueryResult>,
): Promise<void> => bot
  .answerInlineQuery(inlineQueryId, results)
  .then(
    () => {
      logger.debug(`Answered inline query ${inlineQueryId}`);

      return;
    },
    (err: Error) => {
      logger.error(
        `Failed to answer inline query ${inlineQueryId}: ${err.message}`,
      );

      return;
    },
  );

bot.on('message', async (
  { text, from: user, chat }: Message,
): Promise<void> => {
  if (!text || !text.length) return;

  const chatInfo = _.pick(
    ['id', 'type', 'title', 'username', 'first_name', 'last_name'],
  )(chat);

  try {
    switch (text) {
      case '/start': {
        logger.info(
          `Sending the start message for chat ${JSON.stringify(chatInfo)}`,
        );
        await Promise.all([
          trackUser(user),
          trackEvent(user.id, 'Requested the start message'),
          sendMessage({
            chat,
            text: 'Привет! Я официальный бот sozdik.kz и могу переводить с ' +
              `русского на казахский и обратно.\n\n${helpText}\n\n` +
              'Разработано: @yenbekbay\nСервис: sozdik.kz',
            parse_mode: 'Markdown',
          }),
        ]);
        break;
      }
      case '/help': {
        logger.info(
          `Sending the help message for chat ${JSON.stringify(chatInfo)}`,
        );
        await Promise.all([
          trackUser(user),
          trackEvent(user.id, 'Requested the help message'),
          sendMessage({
            chat,
            text: helpText,
            parse_mode: 'Markdown',
          }),
        ]);
        break;
      }
      default: {
        const [translations] = await Promise.all([
          getTranslationsForQuery(text.toLowerCase()),
          sendChatAction(chat.id, 'typing'),
        ]);

        await Promise.all([
          trackUser(user),
          trackEvent(user.id, 'Requested translations', {
            query: text,
            kk_translation: !!_.find({ toLang: 'kk' })(translations),
            ru_translation: !!_.find({ toLang: 'ru' })(translations),
          }),
        ]);

        if (translations.length) {
          await Promise.all(_.map(
            (translation: Translation): Promise<void> => sendMessage({
              chat,
              text: `${translation.title}:\n${translation.text}`,
              parse_mode: 'Markdown',
              disable_web_page_preview: true,
            }))(translations));
        } else {
          await sendMessage({
            chat,
            text: 'К сожалению, я не знаю, как это перевести 😔',
          });
        }
      }
    }
  } catch (err) {
    logger.error(
      `Failed to reply to a message in chat ${chatInfo}: ${err.message}`,
    );

    await sendMessage({
      chat,
      text: 'Что-то пошло не так. Пожалуйста, попробуйте еще раз чуть позже.',
    });
  }
});

bot.on('inline_query', async (
  { id, query, from: user }: InlineQuery,
): Promise<void> => {
  if (!query || query.length < 2) return;

  const translations = await getTranslationsForQuery(query.toLowerCase());

  await Promise.all([
    trackUser(user),
    translations.length && trackEvent(user.id, 'Sent an inline query', {
      query,
      kk_translation: !!_.find({ toLang: 'kk' })(translations),
      ru_translation: !!_.find({ toLang: 'ru' })(translations),
    }),
  ]);

  const results = _.map(
    ({ text, title }: Translation): InlineQueryResult => ({
      type: 'article',
      id: crypto
        .createHash('md5')
        .update(text, 'utf8')
        .digest('hex'),
      title: removeMarkdown(title),
      description: removeMarkdown(text),
      input_message_content: {
        message_text: `${title}:\n${text}`,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      },
    }),
  )(translations);

  await answerInlineQuery(id, results);
});
