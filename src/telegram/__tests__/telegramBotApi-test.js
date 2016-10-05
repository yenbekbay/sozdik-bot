/* @flow */

import createLogger from '../../createLogger';
import telegramBotApi, {
  request,
  urlForTelegramApiMethod,
} from '../telegramBotApi';

const sampleInlineQueryResult = {
  type: 'article',
  id: '123',
  title: 'test',
  input_message_content: {
    message_text: 'test',
  },
};
const logger = createLogger('test');

describe('telegramBotApi', () => {
  let botApi;

  beforeAll(() => {
    botApi = telegramBotApi(logger);
  });

  beforeEach(() => {
    request.post.mockClear();
    logger.error.mockClear();
  });

  it('sends a message', async () => {
    await botApi.sendMessage({
      chat: { id: '123', type: 'private' },
      text: 'test',
      parse_mode: 'Markdown',
    });

    // $FlowMissingDefinition
    expect(request.post).toHaveBeenCalledTimes(1);
    // $FlowMissingDefinition
    expect(request.post).toHaveBeenLastCalledWith({
      url: urlForTelegramApiMethod('sendMessage'),
      form: {
        chat_id: '123',
        text: 'test',
        parse_mode: 'Markdown',
      },
    });
  });

  it('catches error if sending a message fails', async () => {
    request.post.mockImplementationOnce(() => Promise.reject(new Error()));

    await botApi.sendMessage({
      chat: { id: '123', type: 'private' },
      text: 'test',
      parse_mode: 'Markdown',
    });

    expect(logger.error).toHaveBeenCalled();
  });

  it('sends a chat action', async () => {
    await botApi.sendChatAction({
      chat: { id: '123', type: 'private' },
      action: 'typing',
    });

    // $FlowMissingDefinition
    expect(request.post).toHaveBeenCalledTimes(1);
    // $FlowMissingDefinition
    expect(request.post).toHaveBeenLastCalledWith({
      url: urlForTelegramApiMethod('sendChatAction'),
      form: {
        chat_id: '123',
        action: 'typing',
      },
    });
  });

  it('catches error if sending a chat action fails', async () => {
    request.post.mockImplementationOnce(() => Promise.reject(new Error()));

    await botApi.sendChatAction({
      chat: { id: '123', type: 'private' },
      action: 'typing',
    });

    expect(logger.error).toHaveBeenCalled();
  });

  it('answers an inline query', async () => {
    await botApi.answerInlineQuery({
      inlineQueryId: '123',
      results: [sampleInlineQueryResult],
    });

    // $FlowMissingDefinition
    expect(request.post).toHaveBeenCalledTimes(1);
    // $FlowMissingDefinition
    expect(request.post).toHaveBeenLastCalledWith({
      url: urlForTelegramApiMethod('answerInlineQuery'),
      form: {
        inline_query_id: '123',
        results: JSON.stringify([sampleInlineQueryResult]),
      },
    });
  });

  it('catches error if answering an inline query fails', async () => {
    request.post.mockImplementationOnce(() => Promise.reject(new Error()));

    await botApi.answerInlineQuery({
      inlineQueryId: '123',
      results: [sampleInlineQueryResult],
    });

    expect(logger.error).toHaveBeenCalled();
  });

  it('sets webhook url', async () => {
    await botApi.setWebhook('https://test.com');

    // $FlowMissingDefinition
    expect(request.post).toHaveBeenCalledTimes(1);
    // $FlowMissingDefinition
    expect(request.post).toHaveBeenLastCalledWith({
      url: urlForTelegramApiMethod('setWebhook'),
      form: { url: 'https://test.com' },
    });
  });

  it('propagates error if setting webhook url fails', async () => {
    request.post.mockImplementationOnce(() => Promise.reject(new Error()));

    try {
      await botApi.setWebhook('https://test.com');
    } catch (err) {
      // $FlowMissingDefinition
      expect(err).toBeInstanceOf(Error);
    }

    expect(logger.error).toHaveBeenCalled();
  });
});
