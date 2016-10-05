/* @flow */

import crypto from 'crypto';

import _ from 'lodash/fp';
import removeMarkdown from 'remove-markdown';

import { getTranslationsForQuery } from '../sozdikApi';
import { trackUser, trackEvent } from '../analytics';
import type { AnswerInlineQueryFn } from './telegramBotApi';
import type { InlineQuery, InlineQueryResult } from './types';
import type { Logger } from '../createLogger';
import type { Translation } from '../sozdikApi';

const handleInlineQuery = (
  { answerInlineQuery, logger }: {
    answerInlineQuery: AnswerInlineQueryFn,
    logger: Logger,
  },
) => async (
  { id, from: user, query }: InlineQuery,
): Promise<?JSON> => {
  if (!query || query.length < 2) return null;

  try {
    const translations = await getTranslationsForQuery(query.toLowerCase());

    await Promise.all([
      trackUser(user),
      translations.length && trackEvent(user.id, 'Sent an inline query', {
        query,
        kk_translation: !!_.find({ toLang: 'kk' }, translations),
        ru_translation: !!_.find({ toLang: 'ru' }, translations),
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
      translations,
    );

    return await answerInlineQuery({ inlineQueryId: id, results });
  } catch (err) {
    logger.error(
      `Failed to answer to an inline query from ${JSON.stringify(user)}:`,
      err.message,
    );

    return null;
  }
};

export default handleInlineQuery;