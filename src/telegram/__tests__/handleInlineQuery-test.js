/* @flow */

import { getTranslationsForQuery } from '../../sozdikApi';
import { trackUser, trackEvent } from '../../analytics';
import createLogger from '../../createLogger';
import curriedHandleInlineQuery from '../handleInlineQuery';

jest.mock('crypto', () => ({
  createHash: () => ({
    update: () => ({
      digest: () => '123',
    }),
  }),
}));

const answerInlineQuery = jest.fn();
const logger = createLogger('test');

const sampleHandleInlineQueryConfig = {
  id: '123',
  from: { id: '123' },
};

describe('handleInlineQuery', () => {
  let handleInlineQuery;

  beforeAll(() => {
    handleInlineQuery = curriedHandleInlineQuery({ answerInlineQuery, logger });
  });

  beforeEach(() => {
    (getTranslationsForQuery: any).mockClear();
    (trackUser: any).mockClear();
    (trackEvent: any).mockClear();
    answerInlineQuery.mockClear();
    logger.error.mockClear();
  });

  it('answers with translations', async () => {
    const query = 'Словарь';

    await handleInlineQuery({
      ...sampleHandleInlineQueryConfig,
      query,
    });

    expect(getTranslationsForQuery).toHaveBeenCalledWith(query.toLowerCase());
    expect(trackUser).toHaveBeenCalledWith(sampleHandleInlineQueryConfig.from);
    expect(trackEvent).toHaveBeenCalledWith(
      sampleHandleInlineQueryConfig.from.id,
      'Sent an inline query',
      {
        kk_translation: true,
        query,
        ru_translation: false,
      },
    );
    expect(answerInlineQuery).toHaveBeenCalledWith({
      inlineQueryId: sampleHandleInlineQueryConfig.id,
      results: [{
        description: 'text',
        id: '123',
        input_message_content: {
          disable_web_page_preview: true,
          message_text: 'title:\ntext',
          parse_mode: 'Markdown',
        },
        title: 'title',
        type: 'article',
      }],
    });
  });

  it('returns early for an ineligible query', async () => {
    await handleInlineQuery({
      ...sampleHandleInlineQueryConfig,
      query: '',
    });

    expect(getTranslationsForQuery).not.toHaveBeenCalled();
    expect(trackUser).not.toHaveBeenCalled();
    expect(trackEvent).not.toHaveBeenCalled();
    expect(answerInlineQuery).not.toHaveBeenCalled();
  });

  it('doesn\'t track an event if no translations were found', async () => {
    await handleInlineQuery({
      ...sampleHandleInlineQueryConfig,
      query: 'Блаблабла',
    });

    expect(getTranslationsForQuery).toHaveBeenCalled();
    expect(trackUser).toHaveBeenCalled();
    expect(trackEvent).not.toHaveBeenCalled();
    expect(answerInlineQuery).toHaveBeenCalled();
  });

  it('catches errors from bot api', async () => {
    (getTranslationsForQuery: any).mockImplementationOnce(
      () => Promise.reject(new Error()),
    );

    await handleInlineQuery({
      ...sampleHandleInlineQueryConfig,
      query: 'Блаблабла',
    });

    expect(logger.error).toHaveBeenCalled();
    expect(answerInlineQuery).not.toHaveBeenCalled();
  });
});
