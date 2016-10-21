/* @flow */

import createTelegramBot from '../createTelegramBot';

jest.mock('../telegramBotApi', () => () => ({
  sendMessage: jest.fn(),
  sendChatAction: jest.fn(),
  answerInlineQuery: jest.fn(),
  setWebhook: jest.fn(),
}));
jest.mock('../handleInlineQuery', () => () => jest.fn());
jest.mock('../handleMessage', () => () => jest.fn());

describe('createTelegramBot', () => {
  let telegramBot;

  beforeAll(() => {
    telegramBot = createTelegramBot();
  });

  beforeEach(() => {
    (telegramBot.__handleInlineQuery: any).mockClear();
    (telegramBot.__handleMessage: any).mockClear();
  });

  it('handles message updates', () => {
    telegramBot.handleUpdate({
      message: {
        message_id: 123,
        from: { id: '123' },
        date: 123,
        chat: { id: '123', type: 'private' },
      },
    });

    // $FlowMissingDefinition
    expect(telegramBot.__handleMessage).toHaveBeenCalledTimes(1);
    expect(telegramBot.__handleInlineQuery).not.toHaveBeenCalled();
  });

  it('handles inline query updates', () => {
    telegramBot.handleUpdate({
      inline_query: {
        id: '123',
        from: { id: '123' },
        query: 'test',
      },
    });

    expect(telegramBot.__handleMessage).not.toHaveBeenCalled();
    // $FlowMissingDefinition
    expect(telegramBot.__handleInlineQuery).toHaveBeenCalledTimes(1);
  });

  it('doesn\'t handle unsupported updates', () => {
    telegramBot.handleUpdate({});

    expect(telegramBot.__handleMessage).not.toHaveBeenCalled();
    expect(telegramBot.__handleInlineQuery).not.toHaveBeenCalled();
  });

  it('runs setup', async () => {
    const sampleWebhookUrl = 'http://example.com';

    telegramBot.setUp(sampleWebhookUrl);

    expect(telegramBot.__botApi.setWebhook)
      .toHaveBeenCalledWith(sampleWebhookUrl);
  });
});
