/* @flow */

import TelegramBotApi, {
  __logger,
  __request,
  __urlForTelegramApiMethod,
} from '../TelegramBotApi';

const sampleInlineQueryResult = {
  type: 'article',
  id: '123',
  title: 'test',
  input_message_content: {
    message_text: 'test',
  },
};

describe('TelegramBotApi', () => {
  beforeEach(() => {
    __request.post.mockClear();
    __logger.error.mockClear();
  });

  it('sends a message', async () => {
    await TelegramBotApi.sendMessage({
      chat: {id: '123', type: 'private'},
      text: 'test',
      parse_mode: 'Markdown',
    });

    expect(__request.post).toHaveBeenCalledTimes(1);
    // $FlowMissingDefinition
    expect(__request.post).toHaveBeenLastCalledWith({
      url: __urlForTelegramApiMethod('sendMessage'),
      form: {
        chat_id: '123',
        text: 'test',
        parse_mode: 'Markdown',
      },
    });
  });

  it('catches error if sending a message fails', async () => {
    __request.post.mockImplementationOnce(() => Promise.reject(new Error()));

    await TelegramBotApi.sendMessage({
      chat: {id: '123', type: 'private'},
      text: 'test',
      parse_mode: 'Markdown',
    });

    expect(__logger.error).toHaveBeenCalled();
  });

  it('sends a chat action', async () => {
    await TelegramBotApi.sendChatAction({
      chat: {id: '123', type: 'private'},
      action: 'typing',
    });

    expect(__request.post).toHaveBeenCalledTimes(1);
    // $FlowMissingDefinition
    expect(__request.post).toHaveBeenLastCalledWith({
      url: __urlForTelegramApiMethod('sendChatAction'),
      form: {
        chat_id: '123',
        action: 'typing',
      },
    });
  });

  it('catches error if sending a chat action fails', async () => {
    __request.post.mockImplementationOnce(() => Promise.reject(new Error()));

    await TelegramBotApi.sendChatAction({
      chat: {id: '123', type: 'private'},
      action: 'typing',
    });

    expect(__logger.error).toHaveBeenCalled();
  });

  it('answers an inline query', async () => {
    await TelegramBotApi.answerInlineQuery({
      inlineQueryId: '123',
      results: [sampleInlineQueryResult],
    });

    expect(__request.post).toHaveBeenCalledTimes(1);
    // $FlowMissingDefinition
    expect(__request.post).toHaveBeenLastCalledWith({
      url: __urlForTelegramApiMethod('answerInlineQuery'),
      form: {
        inline_query_id: '123',
        results: JSON.stringify([sampleInlineQueryResult]),
      },
    });
  });

  it('catches error if answering an inline query fails', async () => {
    __request.post.mockImplementationOnce(() => Promise.reject(new Error()));

    await TelegramBotApi.answerInlineQuery({
      inlineQueryId: '123',
      results: [sampleInlineQueryResult],
    });

    expect(__logger.error).toHaveBeenCalled();
  });

  it('sets webhook url', async () => {
    await TelegramBotApi.setWebhook('https://test.com');

    expect(__request.post).toHaveBeenCalledTimes(1);
    // $FlowMissingDefinition
    expect(__request.post).toHaveBeenLastCalledWith({
      url: __urlForTelegramApiMethod('setWebhook'),
      form: {url: 'https://test.com'},
    });
  });

  it('propagates error if setting webhook url fails', async () => {
    __request.post.mockImplementationOnce(() => Promise.reject(new Error()));

    try {
      await TelegramBotApi.setWebhook('https://test.com');
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
    }

    expect(__logger.error).toHaveBeenCalled();
  });
});
