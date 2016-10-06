/* @flow */

import crypto from 'crypto';

import _ from 'lodash/fp';
import rp from 'request-promise';
import toMarkdown from 'to-markdown';

import env from './env';
import createLogger from './createLogger';

export type Language = 'ru' | 'kk';
export type Translation = {
  toLang: Language,
  fromLang: Language,
  text: string,
  url: string,
  title: string,
};

const { sozdikApiKey } = env;
const logger = createLogger('sozdik-api');

const client = 'telegram';
const formattedLanguageMappings = {
  ru: 'по-русски',
  kk: 'по-казахски',
};
const request = rp.defaults({
  headers: { 'User-Agent': 'sozdik-bot' },
  gzip: true,
  json: true,
});

const getTranslation = async (
  query: string,
  fromLang: Language,
  toLang: Language,
): Promise<?Translation> => {
  const hash = crypto
    .createHash('md5')
    .update(`${client}${sozdikApiKey}${fromLang}${toLang}${query}`, 'utf8')
    .digest('hex');

  const json = await request({
    url: 'http://api.sozdik.kz/translate',
    qs: {
      client,
      lang_from: fromLang,
      lang_to: toLang,
      phrase: query,
      hash,
      strict: 0,
      output_format: 'json',
      output_samples: 1,
      api_version: '1.0',
      client_version: '0.1.0',
    },
  });

  if (json.message !== 'Found' || !json.translation) return null;

  const converters = [{
    filter: 'abbr',
    replacement: (content: string) => `_${content}_`,
  }, {
    filter: (node: Object) => node.nodeName === 'A'
      && node.getAttribute('href')
      && !/^https?:\/\//.test(node.getAttribute('href')),
    replacement: (content: string, node: Object) =>
      `[${content}](https://sozdik.kz/ru${node.getAttribute('href')}` +
      `${node.title ? ` "${node.title}"` : ''})`,
  }];

  const text = toMarkdown(json.translation, { converters })
    .replace(/(\d+)\\./g, '$1.')
    .replace(/<\/?span>/g, '');

  if (!text) return null;

  return {
    query,
    text,
    fromLang,
    toLang,
    url: json.url_short,
    title: `*"${query}" ${formattedLanguageMappings[toLang]}*`,
  };
};

const getTranslationsForQuery = async (
  query: string,
): Promise<Array<Translation>> => {
  const translations = _.compact(await Promise.all([
    getTranslation(query, 'kk', 'ru'),
    !/[әіңғүұқөһ]/i.test(query) && getTranslation(query, 'ru', 'kk'),
  ]));

  if (translations.length) {
    _.forEach(
      (translation: Translation) => {
        logger.debug(
          `Found a ${translation.toLang === 'ru' ? 'Russian' : 'Kazakh'} ` +
          `translation for "${query}"`,
        );
      },
      translations,
    );
  } else {
    logger.debug(`No translations found for "${query}"`);
  }

  return translations;
};

export { logger as __logger };
export { getTranslation, getTranslationsForQuery };
