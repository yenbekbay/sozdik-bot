/* @flow */

import Analytics from 'src/services/Analytics';
import config from 'src/config';
import getSozdikApi from 'src/services/getSozdikApi';
import TelegramBotApi from 'src/services/TelegramBotApi';

import handleMessage, {__logger} from '../handleMessage';

jest.mock('../../services/TelegramBotApi');

const sozdikApi = getSozdikApi('telegram');

const sampleHandleMessageConfig = {
  from: {id: '123'},
  chat: {id: '123', type: 'private'},
};

describe('handleMessage', () => {
  beforeEach(() => {
    (sozdikApi.getTranslationsForQuery: $FlowFixMe).mockClear();
    (Analytics.trackUser: $FlowFixMe).mockClear();
    (Analytics.trackEvent: $FlowFixMe).mockClear();
    (TelegramBotApi.sendMessage: $FlowFixMe).mockClear();
    (TelegramBotApi.sendChatAction: $FlowFixMe).mockClear();
    __logger.error.mockClear();
  });

  it('replies to /start command', async () => {
    await handleMessage({
      ...sampleHandleMessageConfig,
      text: '/start',
    });

    expect(sozdikApi.getTranslationsForQuery).not.toHaveBeenCalled();
    expect(TelegramBotApi.sendChatAction).not.toHaveBeenCalled();
    expect(Analytics.trackUser).toHaveBeenCalledWith(
      sampleHandleMessageConfig.from,
    );
    expect(Analytics.trackEvent).toHaveBeenCalledWith(
      sampleHandleMessageConfig.from.id,
      'Requested the start message',
    );
    expect(TelegramBotApi.sendMessage).toHaveBeenCalledWith({
      chat: sampleHandleMessageConfig.chat,
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      text: config.telegramStartText,
    });
  });

  it('replies to /help command', async () => {
    await handleMessage({
      ...sampleHandleMessageConfig,
      text: '/help',
    });

    expect(sozdikApi.getTranslationsForQuery).not.toHaveBeenCalled();
    expect(TelegramBotApi.sendChatAction).not.toHaveBeenCalled();
    expect(Analytics.trackUser).toHaveBeenCalledWith(
      sampleHandleMessageConfig.from,
    );
    expect(Analytics.trackEvent).toHaveBeenCalledWith(
      sampleHandleMessageConfig.from.id,
      'Requested the help message',
    );
    expect(TelegramBotApi.sendMessage).toHaveBeenCalledWith({
      chat: sampleHandleMessageConfig.chat,
      parse_mode: 'Markdown',
      text: config.telegramHelpText,
    });
  });

  it('replies with translations', async () => {
    const text = 'Словарь';

    await handleMessage({
      ...sampleHandleMessageConfig,
      text,
    });

    expect(sozdikApi.getTranslationsForQuery).toHaveBeenCalledWith(
      text.toLowerCase(),
    );
    expect(TelegramBotApi.sendChatAction).toHaveBeenCalledWith({
      chat: sampleHandleMessageConfig.chat,
      action: 'typing',
    });
    expect(Analytics.trackUser).toHaveBeenCalledWith(
      sampleHandleMessageConfig.from,
    );
    expect(Analytics.trackEvent).toHaveBeenCalledWith(
      sampleHandleMessageConfig.from.id,
      'Requested translations',
      {
        query: text,
        kk_translation: true,
        ru_translation: false,
      },
    );
    expect(TelegramBotApi.sendMessage).toHaveBeenCalledWith({
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

    expect(sozdikApi.getTranslationsForQuery).not.toHaveBeenCalled();
    expect(TelegramBotApi.sendChatAction).not.toHaveBeenCalled();
    expect(Analytics.trackUser).not.toHaveBeenCalled();
    expect(Analytics.trackEvent).not.toHaveBeenCalled();
    expect(TelegramBotApi.sendMessage).not.toHaveBeenCalled();
  });

  it('sends a predefined message if no translations were found', async () => {
    await handleMessage({
      ...sampleHandleMessageConfig,
      text: 'Блаблабла',
    });

    expect(TelegramBotApi.sendMessage).toHaveBeenCalledWith({
      chat: sampleHandleMessageConfig.chat,
      text: config.noTranslationsFoundText,
    });
  });

  it('catches errors from telegram bot api', async () => {
    (sozdikApi.getTranslationsForQuery: $FlowFixMe).mockImplementationOnce(() =>
      Promise.reject(new Error()),
    );

    await handleMessage({
      ...sampleHandleMessageConfig,
      text: 'Блаблабла',
    });

    expect(__logger.error).toHaveBeenCalled();
    expect(TelegramBotApi.sendMessage).toHaveBeenCalledWith({
      chat: sampleHandleMessageConfig.chat,
      text: config.errorText,
    });
  });
});
