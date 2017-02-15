/* @flow */

import _ from 'lodash/fp';

import type {Language} from '../sozdikApi';

const sampleTranslation = {
  query: 'query',
  text: 'text',
  title: 'title',
  url: 'url',
};

const translations = {
  машина: [
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
  словарь: [
    {
      ...sampleTranslation,
      query: 'словарь',
      fromLang: 'ru',
      toLang: 'kk',
    },
  ],
  лұғат: [
    {
      ...sampleTranslation,
      query: 'лұғат',
      fromLang: 'kk',
      toLang: 'ru',
    },
  ],
};

const sozdikApi = () => ({
  getTranslation: jest.fn((
    query: string,
    fromLang: Language,
    toLang: Language,
  ) =>
    _.find({toLang, fromLang}, translations[query])),
  getTranslationsForQuery: jest.fn(
    (query: string) => translations[query] || [],
  ),
});

export default sozdikApi;
