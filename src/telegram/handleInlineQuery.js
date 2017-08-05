/* @flow */

import crypto from 'crypto';

import _ from 'lodash/fp';
import removeMarkdown from 'remove-markdown';

import Analytics from 'src/services/Analytics';
import getSozdikApi from 'src/services/getSozdikApi';
import makeLogger from 'src/utils/makeLogger';
import TelegramBotApi from 'src/services/TelegramBotApi';
import type {
  TelegramInlineQueryType,
  TelegramInlineQueryResultType,
} from 'src/services/TelegramBotApi';
import type {TranslationType} from 'src/services/getSozdikApi';

const logger = makeLogger('telegram/handleMessage');
const sozdikApi = getSozdikApi('telegram');

const handleInlineQuery = async ({
  id,
  from: user,
  query,
}: TelegramInlineQueryType) => {
  if (!query || query.length < 2) return null; // eslint-disable-line no-magic-numbers

  try {
    const translations = await sozdikApi.getTranslationsForQuery(
      query.toLowerCase(),
    );
    const results = _.map(
      ({text, title}: TranslationType): TelegramInlineQueryResultType => ({
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
      TelegramBotApi.answerInlineQuery({inlineQueryId: id, results}),
      Analytics.trackUser(user),
      translations.length
        ? Analytics.trackEvent(user.id, 'Sent an inline query', {
            query,
            kk_translation: !!_.find({toLang: 'kk'}, translations),
            ru_translation: !!_.find({toLang: 'ru'}, translations),
          })
        : Promise.resolve(),
    ]);

    return response;
  } catch (err) {
    logger.error(
      `Failed to answer to an inline query from ${JSON.stringify(
        user,
      )}: ${err.message}`,
    );

    return null;
  }
};

export default handleInlineQuery;
export {logger as __logger};
