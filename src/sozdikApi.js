/* @flow */

import crypto from 'crypto';

import _ from 'lodash/fp';
import rp from 'request-promise';
import toMarkdown from 'to-markdown';

import env from './env';
import getLogger from './getLogger';

export type Language = 'ru' | 'kk';
export type Translation = {
  toLang: Language,
  fromLang: Language,
  text: string,
  url: string,
  title: string
};

const { sozdikApiKey } = env;
const logger = getLogger(['sozdik-api']);

const client = 'telegram';
const formattedLanguageMappings = {
  ru: 'по-русски',
  kk: 'по-казахски',
};
const request = rp.defaults({
  headers: { 'User-Agent': 'sozdik-telegram-bot' },
  gzip: true,
});

export const getTranslation = async (
  query: string,
  fromLang: Language,
  toLang: Language,
): Promise<?Translation> => {
  if (!sozdikApiKey) {
    throw new Error('Missing sozdik.kz API key');
  }

  const hash = crypto
    .createHash('md5')
    .update(`${client}${sozdikApiKey}${fromLang}${toLang}${query}`, 'utf8')
    .digest('hex');

  const params = {
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
  };
  const options = {
    url: 'http://api.sozdik.kz/translate',
    qs: params,
    json: true,
  };

  const json = await request(options);

  if (json.message !== 'Found' || !json.translation) return null;

  const converters = [{
    filter: 'abbr',
    replacement: (content: string): string => `_${content}_`,
  }, {
    filter: (node: Object): bool => node.nodeName === 'A'
      && node.getAttribute('href')
      && !/^https?:\/\//.test(node.getAttribute('href')),
    replacement: (content: string, node: Object): string =>
      `[${content}](https://sozdik.kz${node.getAttribute('href')}` +
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

export const getTranslationsForQuery = async (
  query: string,
): Promise<Array<Translation>> => {
  const translations = _.compact(await Promise.all([
    getTranslation(query, 'kk', 'ru'),
    !/[әіңғүұқөһ]/i.test(query)
      ? getTranslation(query, 'ru', 'kk')
      : Promise.resolve(),
  ]));

  if (translations.length) {
    _.forEach((translation: Translation) => {
      logger.info(
        `Found a ${translation.toLang === 'ru' ? 'Russian' : 'Kazakh'} ` +
        `translation for "${query}"`,
      );
    })(translations);
  } else {
    logger.info(`No translations found for "${query}"`);
  }

  return translations;
};
