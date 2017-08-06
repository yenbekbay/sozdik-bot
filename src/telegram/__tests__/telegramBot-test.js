/* @flow */

import TelegramBotApi from 'src/services/TelegramBotApi';

import telegramBot from '../telegramBot';
import handleInlineQuery from '../handleInlineQuery';
import handleMessage from '../handleMessage';

jest.mock('../../services/TelegramBotApi');
jest.mock('../handleInlineQuery', () => jest.fn(() => Promise.resolve()));
jest.mock('../handleMessage', () => jest.fn(() => Promise.resolve()));

describe('telegramBot', () => {
  beforeEach(() => {
    (handleInlineQuery: $FlowFixMe).mockClear();
    (handleMessage: $FlowFixMe).mockClear();
  });

  it('handles message updates', () => {
    telegramBot.handleUpdate({
      message: {
        message_id: 123,
        from: {id: '123'},
        date: 123,
        chat: {id: '123', type: 'private'},
      },
    });

    expect(handleMessage).toHaveBeenCalledTimes(1);
    expect(handleInlineQuery).not.toHaveBeenCalled();
  });

  it('handles inline query updates', () => {
    telegramBot.handleUpdate({
      inline_query: {
        id: '123',
        from: {id: '123'},
        query: 'test',
      },
    });

    expect(handleMessage).not.toHaveBeenCalled();
    expect(handleInlineQuery).toHaveBeenCalledTimes(1);
  });

  it("doesn't handle unsupported updates", () => {
    telegramBot.handleUpdate({});

    expect(handleMessage).not.toHaveBeenCalled();
    expect(handleInlineQuery).not.toHaveBeenCalled();
  });

  it('runs setup', async () => {
    const sampleWebhookUrl = 'http://example.com';

    telegramBot.setUp(sampleWebhookUrl);

    expect(TelegramBotApi.setWebhook).toHaveBeenCalledWith(sampleWebhookUrl);
  });
});
