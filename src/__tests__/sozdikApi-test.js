/* @flow */

/* eslint-disable import/no-extraneous-dependencies */
import { expect } from 'chai';
import proxyquire from 'proxyquire';
import test from 'ava';
/* eslint-enable import/no-extraneous-dependencies */
import _ from 'lodash';

import getLoggerStub from './getLoggerStub';

const { getTranslation, getTranslationsForQuery } = proxyquire.noCallThru()(
  '../sozdikApi', {
    './getLogger': getLoggerStub,
  },
);

test('translates from ru to kk', async (): Promise<void> => {
  expect(await getTranslation('словарь', 'ru', 'kk')).to.deep.equal({
    query: 'словарь',
    // eslint-disable-next-line max-len
    text: '_муж._ [сөздік](https://sozdik.kz/dictionary/translate/kk/ru/сөздік/); [лұғат](https://sozdik.kz/dictionary/translate/kk/ru/лұғат/) _только ед._ _(лексика)_ сөз байлығы; сөздік құрамы _(бір тілдің не жазушының)_',
    fromLang: 'ru',
    toLang: 'kk',
    url: 'http://szd.kz/Misd56',
    title: '*"словарь" по-казахски*',
  });
});

test('translates from kk to ru', async (): Promise<void> => {
  expect(await getTranslation('лұғат', 'kk', 'ru')).to.deep.equal({
    query: 'лұғат',
    // eslint-disable-next-line max-len
    text: '_ар._ _уст._ [язык](https://sozdik.kz/dictionary/translate/ru/kk/язык/) _книжн._ [словарь](https://sozdik.kz/dictionary/translate/ru/kk/словарь/)  \n_син._ [сөздік](https://sozdik.kz/dictionary/translate/kk/ru/сөздік/), [сөзтізбе](https://sozdik.kz/dictionary/translate/kk/ru/сөзтізбе/)',
    fromLang: 'kk',
    toLang: 'ru',
    url: 'http://szd.kz/*PdASd',
    title: '*"лұғат" по-русски*',
  });
});

test('fails to translate an unknown word', async (): Promise<void> => {
  expect(await getTranslation('блаблабла', 'ru', 'kk')).to.be.null();
});

test('returns all translations for a common word', async (): Promise<void> => {
  const translations = await getTranslationsForQuery('машина');

  expect(translations).to.be.an('array').and.to.have.lengthOf(2);
  expect(_.find(translations, { fromLang: 'kk', toLang: 'ru' })).to.be.ok();
  expect(_.find(translations, { fromLang: 'ru', toLang: 'kk' })).to.be.ok();
});

test(
  'returns only a Kazakh translation for a Kazakh word',
  async (): Promise<void> => {
    const translations = await getTranslationsForQuery('лұғат');

    expect(translations).to.be.an('array').and.to.have.lengthOf(1);
    expect(translations[0]).to.contain.all.keys({
      fromLang: 'kk',
      toLang: 'ru',
    });
  },
);

test(
  'returns only a Russian translation for a Russian word',
  async (): Promise<void> => {
    const translations = await getTranslationsForQuery('словарь');

    expect(translations).to.be.an('array').and.to.have.lengthOf(1);
    expect(translations[0]).to.contain.all.keys({
      fromLang: 'ru',
      toLang: 'kk',
    });
  },
);
