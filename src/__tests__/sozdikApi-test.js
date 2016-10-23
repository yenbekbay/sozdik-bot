/* @flow */

import sozdikApi from '../sozdikApi';

jest.unmock('request-promise');
jest.unmock('../sozdikApi');

const {
  getTranslation,
  getTranslationsForQuery,
} = sozdikApi('facebook');

describe('sozdikApi', () => {
  it('translates from ru to kk', async () => {
    expect(await getTranslation('словарь', 'ru', 'kk')).toMatchSnapshot();
  });

  it('translates from kk to ru', async () => {
    expect(await getTranslation('лұғат', 'kk', 'ru')).toMatchSnapshot();
  });

  it('fails to translate an unknown word', async () => {
    expect(await getTranslation('блаблабла', 'ru', 'kk')).toBeNull();
  });

  it('returns all translations for an universal word', async () => {
    expect(await getTranslationsForQuery('машина')).toMatchSnapshot();
  });

  it('returns only a kk translation for a kk word', async () => {
    expect(await getTranslationsForQuery('лұғат')).toMatchSnapshot();
  });

  it('returns only a ru translation for a ru word', async () => {
    expect(await getTranslationsForQuery('словарь')).toMatchSnapshot();
  });
});
