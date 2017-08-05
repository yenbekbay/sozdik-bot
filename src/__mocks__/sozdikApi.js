/* @flow */

import _ from 'lodash/fp';

import type {LanguageType} from '../sozdikApi';

const sampleTranslation = {
  query: 'query',
  text: 'text',
  title: 'title',
  url: 'url',
};

const translations = {
  // prettier-ignore
  'машина': [
    {
      ...sampleTranslation,
      query: 'машина',
      fromLang: 'kk',
      toLang: 'ru',
    },
    {
      ...sampleTranslation,
      query: 'машина',
      fromLang: 'ru',
      toLang: 'kk',
    },
  ],
  // prettier-ignore
  'словарь': [
    {
      ...sampleTranslation,
      query: 'словарь',
      fromLang: 'ru',
      toLang: 'kk',
    },
  ],
  // prettier-ignore
  'лұғат': [
    {
      ...sampleTranslation,
      query: 'лұғат',
      fromLang: 'kk',
      toLang: 'ru',
    },
  ],
};

const sozdikApi = () => ({
  getTranslation: jest.fn(
    (query: string, fromLang: LanguageType, toLang: LanguageType) =>
      _.find({toLang, fromLang}, translations[query]),
  ),
  getTranslationsForQuery: jest.fn(
    (query: string) => translations[query] || [],
  ),
});

export default sozdikApi;
