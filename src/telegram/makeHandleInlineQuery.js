/* @flow */

import crypto from 'crypto';

import _ from 'lodash/fp';
import removeMarkdown from 'remove-markdown';

import {trackUser, trackEvent} from '../analytics';
import type {AnswerInlineQueryFnType} from './makeTelegramBotApi';
import type {InlineQueryType, InlineQueryResultType} from './types';
import type {LoggerType} from '../createLogger';
import type {TranslationType, GetTranslationForQueryFnType} from '../sozdikApi';

const makeHandleInlineQuery = ({
  answerInlineQuery,
  getTranslationsForQuery,
  logger,
}: {
  answerInlineQuery: AnswerInlineQueryFnType,
  getTranslationsForQuery: GetTranslationForQueryFnType,
  logger: LoggerType,
}) => async ({id, from: user, query}: InlineQueryType) => {
  if (!query || query.length < 2) return null; // eslint-disable-line no-magic-numbers

  try {
    const translations = await getTranslationsForQuery(query.toLowerCase());
    const results = _.map(
      ({text, title}: TranslationType): InlineQueryResultType => ({
        type: 'article',
        id: crypto.createHash('md5').update(text, 'utf8').digest('hex'),
        title: removeMarkdown(title),
        description: removeMarkdown(text),
        input_message_content: {
          message_text: `${title}:\n${text}`,
          parse_mode: 'Markdown',
          disable_web_page_preview: true,
        },
      }),
      translations,
    );

    const [response] = await Promise.all([
      answerInlineQuery({inlineQueryId: id, results}),
      trackUser(user),
      translations.length
        ? trackEvent(user.id, 'Sent an inline query', {
            query,
            kk_translation: !!_.find({toLang: 'kk'}, translations),
            ru_translation: !!_.find({toLang: 'ru'}, translations),
          })
        : Promise.resolve(),
    ]);

    return response;
  } catch (err) {
    logger.error(
      `Failed to answer to an inline query from ${JSON.stringify(user)}:`,
      err.message,
    );

    return null;
  }
};

export default makeHandleInlineQuery;
