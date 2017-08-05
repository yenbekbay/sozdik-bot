/* @flow */

import MessengerPlatform, {
  __logger,
  __request,
  __sendApiUrl,
  __threadSettingsUrl,
  __urlForUserProfileRequest,
} from '../MessengerPlatform';

describe('MessengerPlatform', () => {
  beforeEach(() => {
    __request.post.mockClear();
    __request.get.mockClear();
    __logger.error.mockClear();
  });

  it('sends a text message', async () => {
    await MessengerPlatform.sendTextMessage({
      recipientId: '123',
      text: 'test',
    });

    expect(__request.post).toHaveBeenCalledTimes(1);
    // $FlowMissingDefinition
    expect(__request.post).toHaveBeenLastCalledWith({
      url: __sendApiUrl,
      form: {
        recipient: {id: '123'},
        message: {text: 'test'},
      },
    });
  });

  it('catches error if sending a text message fails', async () => {
    __request.post.mockImplementationOnce(() => Promise.reject(new Error()));

    await MessengerPlatform.sendTextMessage({
      recipientId: '123',
      text: 'test',
    });

    expect(__logger.error).toHaveBeenCalled();
  });

  it('sends a sender action', async () => {
    await MessengerPlatform.sendSenderAction({
      recipientId: '123',
      action: 'typing_on',
    });

    expect(__request.post).toHaveBeenCalledTimes(1);
    // $FlowMissingDefinition
    expect(__request.post).toHaveBeenLastCalledWith({
      url: __sendApiUrl,
      form: {
        recipient: {id: '123'},
        sender_action: 'typing_on',
      },
    });
  });

  it('catches error if sending a sender action fails', async () => {
    __request.post.mockImplementationOnce(() => Promise.reject(new Error()));

    await MessengerPlatform.sendSenderAction({
      recipientId: '123',
      action: 'typing_on',
    });

    expect(__logger.error).toHaveBeenCalled();
  });

  it('sets greeting text', async () => {
    await MessengerPlatform.setGreetingText('test');

    expect(__request.post).toHaveBeenCalledTimes(1);
    // $FlowMissingDefinition
    expect(__request.post).toHaveBeenLastCalledWith({
      url: __threadSettingsUrl,
      form: {
        setting_type: 'greeting',
        greeting: {text: 'test'},
      },
    });
  });

  it('propagates error if setting greeting text fails', async () => {
    __request.post.mockImplementationOnce(() => Promise.reject(new Error()));

    try {
      await MessengerPlatform.setGreetingText('test');
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
    }

    expect(__logger.error).toHaveBeenCalled();
  });

  it('fetches a user profile', async () => {
    await MessengerPlatform.getUserProfile('123');

    expect(__request.get).toHaveBeenCalledTimes(1);
    // $FlowMissingDefinition
    expect(__request.get).toHaveBeenLastCalledWith({
      url: __urlForUserProfileRequest('123'),
      qs: {
        fields: JSON.stringify([
          'first_name',
          'last_name',
          'profile_pic',
          'locale',
          'timezone',
          'gender',
        ]),
      },
    });
  });

  it('catches error if fetching a user profile fails', async () => {
    __request.get.mockImplementationOnce(() => Promise.reject(new Error()));

    await MessengerPlatform.getUserProfile('123');

    expect(__logger.error).toHaveBeenCalled();
  });
});
