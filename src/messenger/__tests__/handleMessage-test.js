/* @flow */

import Analytics from 'src/services/Analytics';
import config from 'src/config';
import getSozdikApi from 'src/services/getSozdikApi';
import MessengerPlatform from 'src/services/MessengerPlatform';

import handleMessage, {__logger} from '../handleMessage';

jest.mock('../../services/MessengerPlatform');

const sozdikApi = getSozdikApi('facebook');

const sampleHandleMessageConfig = {
  recipientId: '123',
};

describe('handleMessage', () => {
  beforeEach(() => {
    (sozdikApi.getTranslationsForQuery: $FlowFixMe).mockClear();
    (Analytics.trackUser: $FlowFixMe).mockClear();
    (Analytics.trackEvent: $FlowFixMe).mockClear();
    (MessengerPlatform.sendTextMessage: $FlowFixMe).mockClear();
    (MessengerPlatform.sendSenderAction: $FlowFixMe).mockClear();
    (MessengerPlatform.getUserProfile: $FlowFixMe).mockClear();
    __logger.error.mockClear();
  });

  it('replies with translations', async () => {
    const text = 'Словарь';

    await handleMessage({
      ...sampleHandleMessageConfig,
      message: {text},
    });

    expect(MessengerPlatform.getUserProfile).toHaveBeenCalledWith(
      sampleHandleMessageConfig.recipientId,
    );
    expect(sozdikApi.getTranslationsForQuery).toHaveBeenCalledWith(
      text.toLowerCase(),
    );
    expect(MessengerPlatform.sendSenderAction).toHaveBeenCalledWith({
      recipientId: sampleHandleMessageConfig.recipientId,
      action: 'typing_on',
    });
    expect(Analytics.trackUser).toHaveBeenCalledWith({
      id: sampleHandleMessageConfig.recipientId,
      first_name: '',
      last_name: '',
    });
    expect(
      Analytics.trackEvent,
    ).toHaveBeenCalledWith(
      sampleHandleMessageConfig.recipientId,
      'Requested translations',
      {
        query: text,
        kk_translation: true,
        ru_translation: false,
      },
    );
    expect(MessengerPlatform.sendTextMessage).toHaveBeenCalledWith({
      recipientId: sampleHandleMessageConfig.recipientId,
      text: 'title:\ntext',
    });
  });

  it('returns early for an ineligible query', async () => {
    await handleMessage({
      ...sampleHandleMessageConfig,
      message: {text: ''},
    });

    expect(MessengerPlatform.getUserProfile).not.toHaveBeenCalled();
    expect(sozdikApi.getTranslationsForQuery).not.toHaveBeenCalled();
    expect(MessengerPlatform.sendSenderAction).not.toHaveBeenCalled();
    expect(Analytics.trackUser).not.toHaveBeenCalled();
    expect(Analytics.trackEvent).not.toHaveBeenCalled();
    expect(MessengerPlatform.sendTextMessage).not.toHaveBeenCalled();
  });

  it('sends a predefined message if no translations were found', async () => {
    await handleMessage({
      ...sampleHandleMessageConfig,
      message: {text: 'Блаблабла'},
    });

    expect(MessengerPlatform.sendTextMessage).toHaveBeenCalledWith({
      recipientId: sampleHandleMessageConfig.recipientId,
      text: config.noTranslationsFoundText,
    });
  });

  it('catches errors from messenger platform', async () => {
    (sozdikApi.getTranslationsForQuery: $FlowFixMe).mockImplementationOnce(() =>
      Promise.reject(new Error()),
    );

    await handleMessage({
      ...sampleHandleMessageConfig,
      message: {text: 'Блаблабла'},
    });

    expect(__logger.error).toHaveBeenCalled();
    expect(MessengerPlatform.sendTextMessage).toHaveBeenCalledWith({
      recipientId: sampleHandleMessageConfig.recipientId,
      text: config.errorText,
    });
  });
});
