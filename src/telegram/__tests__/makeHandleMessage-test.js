/* @flow */

import {trackUser, trackEvent} from 'src/analytics';
import makeLogger from 'src/makeLogger';
import config from 'src/config';
import getSozdikApi from 'src/getSozdikApi';

import makeHandleMessage from '../makeHandleMessage';

const sampleHandleMessageConfig = {
  from: {id: '123'},
  chat: {id: '123', type: 'private'},
};

const sendMessage = jest.fn();
const sendChatAction = jest.fn();
const {getTranslationsForQuery} = getSozdikApi('telegram');
const logger = makeLogger('test');

describe('makeHandleMessage', () => {
  let handleMessage;

  beforeAll(() => {
    handleMessage = makeHandleMessage({
      sendMessage,
      sendChatAction,
      getTranslationsForQuery,
      logger,
    });
  });

  beforeEach(() => {
    (getTranslationsForQuery: any).mockClear();
    (trackUser: any).mockClear();
    (trackEvent: any).mockClear();
    sendMessage.mockClear();
    sendChatAction.mockClear();
    logger.error.mockClear();
  });

  it('replies to /start command', async () => {
    await handleMessage({
      ...sampleHandleMessageConfig,
      text: '/start',
    });

    expect(getTranslationsForQuery).not.toHaveBeenCalled();
    expect(sendChatAction).not.toHaveBeenCalled();
    expect(trackUser).toHaveBeenCalledWith(sampleHandleMessageConfig.from);
    expect(trackEvent).toHaveBeenCalledWith(
      sampleHandleMessageConfig.from.id,
      'Requested the start message',
    );
    expect(sendMessage).toHaveBeenCalledWith({
      chat: sampleHandleMessageConfig.chat,
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      text: config.startText,
    });
  });

  it('replies to /help command', async () => {
    await handleMessage({
      ...sampleHandleMessageConfig,
      text: '/help',
    });

    expect(getTranslationsForQuery).not.toHaveBeenCalled();
    expect(sendChatAction).not.toHaveBeenCalled();
    expect(trackUser).toHaveBeenCalledWith(sampleHandleMessageConfig.from);
    expect(trackEvent).toHaveBeenCalledWith(
      sampleHandleMessageConfig.from.id,
      'Requested the help message',
    );
    expect(sendMessage).toHaveBeenCalledWith({
      chat: sampleHandleMessageConfig.chat,
      parse_mode: 'Markdown',
      text: config.helpText,
    });
  });

  it('replies with translations', async () => {
    const text = 'Словарь';

    await handleMessage({
      ...sampleHandleMessageConfig,
      text,
    });

    expect(getTranslationsForQuery).toHaveBeenCalledWith(text.toLowerCase());
    expect(sendChatAction).toHaveBeenCalledWith({
      chat: sampleHandleMessageConfig.chat,
      action: 'typing',
    });
    expect(trackUser).toHaveBeenCalledWith(sampleHandleMessageConfig.from);
    expect(trackEvent).toHaveBeenCalledWith(
      sampleHandleMessageConfig.from.id,
      'Requested translations',
      {
        query: text,
        kk_translation: true,
        ru_translation: false,
      },
    );
    expect(sendMessage).toHaveBeenCalledWith({
      chat: sampleHandleMessageConfig.chat,
      disable_web_page_preview: true,
      parse_mode: 'Markdown',
      text: 'title:\ntext',
    });
  });

  it('returns early for an ineligible query', async () => {
    await handleMessage({
      ...sampleHandleMessageConfig,
      text: '',
    });

    expect(getTranslationsForQuery).not.toHaveBeenCalled();
    expect(sendChatAction).not.toHaveBeenCalled();
    expect(trackUser).not.toHaveBeenCalled();
    expect(trackEvent).not.toHaveBeenCalled();
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it('sends a predefined message if no translations were found', async () => {
    await handleMessage({
      ...sampleHandleMessageConfig,
      text: 'Блаблабла',
    });

    expect(sendMessage).toHaveBeenCalledWith({
      chat: sampleHandleMessageConfig.chat,
      text: config.noTranslationsFoundText,
    });
  });

  it('catches errors from telegram bot api', async () => {
    (getTranslationsForQuery: any).mockImplementationOnce(() =>
      Promise.reject(new Error()),
    );

    await handleMessage({
      ...sampleHandleMessageConfig,
      text: 'Блаблабла',
    });

    expect(logger.error).toHaveBeenCalled();
    expect(sendMessage).toHaveBeenCalledWith({
      chat: sampleHandleMessageConfig.chat,
      text: config.errorText,
    });
  });
});
