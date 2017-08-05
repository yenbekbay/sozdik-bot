/* @flow */

import Analytics from 'src/services/Analytics';
import getSozdikApi from 'src/services/getSozdikApi';
import TelegramBotApi from 'src/services/TelegramBotApi';

import handleInlineQuery, {__logger} from '../handleInlineQuery';

jest.mock('crypto', () => ({
  createHash: () => ({
    update: () => ({
      digest: () => '123',
    }),
  }),
}));
jest.mock('../../services/TelegramBotApi');

const sozdikApi = getSozdikApi('telegram');

const sampleHandleInlineQueryConfig = {
  id: '123',
  from: {id: '123'},
};

describe('handleInlineQuery', () => {
  beforeEach(() => {
    (sozdikApi.getTranslationsForQuery: $FlowFixMe).mockClear();
    (Analytics.trackUser: $FlowFixMe).mockClear();
    (Analytics.trackEvent: $FlowFixMe).mockClear();
    (TelegramBotApi.answerInlineQuery: $FlowFixMe).mockClear();
    __logger.error.mockClear();
  });

  it('answers with translations', async () => {
    const query = 'Словарь';

    await handleInlineQuery({
      ...sampleHandleInlineQueryConfig,
      query,
    });

    expect(sozdikApi.getTranslationsForQuery).toHaveBeenCalledWith(
      query.toLowerCase(),
    );
    expect(Analytics.trackUser).toHaveBeenCalledWith(
      sampleHandleInlineQueryConfig.from,
    );
    expect(
      Analytics.trackEvent,
    ).toHaveBeenCalledWith(
      sampleHandleInlineQueryConfig.from.id,
      'Sent an inline query',
      {
        kk_translation: true,
        query,
        ru_translation: false,
      },
    );
    expect(TelegramBotApi.answerInlineQuery).toHaveBeenCalledWith({
      inlineQueryId: sampleHandleInlineQueryConfig.id,
      results: [
        {
          description: 'text',
          id: '123',
          input_message_content: {
            disable_web_page_preview: true,
            message_text: 'title:\ntext',
            parse_mode: 'Markdown',
          },
          title: 'title',
          type: 'article',
        },
      ],
    });
  });

  it('returns early for an ineligible query', async () => {
    await handleInlineQuery({
      ...sampleHandleInlineQueryConfig,
      query: '',
    });

    expect(sozdikApi.getTranslationsForQuery).not.toHaveBeenCalled();
    expect(Analytics.trackUser).not.toHaveBeenCalled();
    expect(Analytics.trackEvent).not.toHaveBeenCalled();
    expect(TelegramBotApi.answerInlineQuery).not.toHaveBeenCalled();
  });

  it("doesn't track an event if no translations were found", async () => {
    await handleInlineQuery({
      ...sampleHandleInlineQueryConfig,
      query: 'Блаблабла',
    });

    expect(sozdikApi.getTranslationsForQuery).toHaveBeenCalled();
    expect(Analytics.trackUser).toHaveBeenCalled();
    expect(Analytics.trackEvent).not.toHaveBeenCalled();
    expect(TelegramBotApi.answerInlineQuery).toHaveBeenCalled();
  });

  it('catches errors from bot api', async () => {
    (sozdikApi.getTranslationsForQuery: $FlowFixMe).mockImplementationOnce(() =>
      Promise.reject(new Error()),
    );

    await handleInlineQuery({
      ...sampleHandleInlineQueryConfig,
      query: 'Блаблабла',
    });

    expect(__logger.error).toHaveBeenCalled();
    expect(TelegramBotApi.answerInlineQuery).not.toHaveBeenCalled();
  });
});
