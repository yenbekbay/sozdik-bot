/* @flow */

import crypto from 'crypto';

import _ from 'lodash/fp';
import rp from 'request-promise';
import toMarkdown from 'to-markdown';

import createLogger from 'src/createLogger';
import config from 'src/config';

export type LanguageType = 'ru' | 'kk';
export type TranslationType = {
  toLang: LanguageType,
  fromLang: LanguageType,
  text: string,
  url: string,
  title: string,
};
export type GetTranslationFnType = (
  query: string,
  fromLang: LanguageType,
  toLang: LanguageType,
) => Promise<?TranslationType>;
export type GetTranslationForQueryFnType = (
  query: string,
) => Promise<Array<TranslationType>>;

const logger = createLogger('sozdik-api');

const formattedLanguageMappings = {
  ru: 'по-русски',
  kk: 'по-казахски',
};
const request = rp.defaults({
  headers: {'User-Agent': 'sozdik-bot'},
  gzip: true,
  json: true,
});

const sozdikApi = (client: 'telegram' | 'facebook') => {
  const apiKey = config.sozdikApiKey[client];

  const getTranslation = async (
    query: string,
    fromLang: LanguageType,
    toLang: LanguageType,
  ) => {
    const hash = crypto
      .createHash('md5')
      .update(`${client}${apiKey}${fromLang}${toLang}${query}`, 'utf8')
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

    const converters = [
      {
        filter: 'abbr',
        replacement: (content: string) => `_${content}_`,
      },
      {
        filter: (node: any) =>
          node.nodeName === 'A' &&
          node.getAttribute('href') &&
          !/^https?:\/\//.test(node.getAttribute('href')),
        replacement: (content: string, node: any) =>
          `[${content}](https://sozdik.kz/ru${node.getAttribute('href')}` +
          `${node.title ? ` "${node.title}"` : ''})`,
      },
    ];

    const text = toMarkdown(json.translation, {converters})
      .replace(/(\d+)\\./g, '$1.')
      .replace(/<\/?span>/g, '');

    if (!text) return null;

    const translation: TranslationType = {
      query,
      text,
      fromLang,
      toLang,
      url: json.url_short,
      title: `*"${query}" ${formattedLanguageMappings[toLang]}*`,
    };

    return translation;
  };

  const getTranslationsForQuery = async (query: string) => {
    const translations: Array<TranslationType> = _.compact(
      await Promise.all([
        getTranslation(query, 'kk', 'ru'),
        !/[әіңғүұқөһ]/i.test(query) && getTranslation(query, 'ru', 'kk'),
      ]),
    );

    if (translations.length > 0) {
      _.forEach((translation: TranslationType) => {
        logger.debug(
          `Found a ${translation.toLang === 'ru' ? 'Russian' : 'Kazakh'} ` +
            `translation for "${query}"`,
        );
      }, translations);
    } else {
      logger.debug(`No translations found for "${query}"`);
    }

    return translations;
  };

  return {getTranslation, getTranslationsForQuery};
};

export default sozdikApi;
export {logger as __logger};
