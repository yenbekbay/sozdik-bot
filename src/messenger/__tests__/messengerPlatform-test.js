/* @flow */

import createLogger from '../../createLogger';
import messengerPlatform, {
  request,
  sendApiUrl,
  threadSettingsUrl,
  urlForUserProfileRequest,
} from '../messengerPlatform';

const logger = createLogger('test');

describe('messengerPlatform', () => {
  let platform;

  beforeAll(() => {
    platform = messengerPlatform(logger);
  });

  beforeEach(() => {
    request.post.mockClear();
    request.get.mockClear();
    logger.error.mockClear();
  });

  it('sends a text message', async () => {
    await platform.sendTextMessage({
      recipientId: '123',
      text: 'test',
    });

    expect(request.post).toHaveBeenCalledTimes(1);
    // $FlowMissingDefinition
    expect(request.post).toHaveBeenLastCalledWith({
      url: sendApiUrl,
      form: {
        recipient: { id: '123' },
        message: { text: 'test' },
      },
    });
  });

  it('catches error if sending a text message fails', async () => {
    request.post.mockImplementationOnce(() => Promise.reject(new Error()));

    await platform.sendTextMessage({
      recipientId: '123',
      text: 'test',
    });

    expect(logger.error).toHaveBeenCalled();
  });

  it('sends a sender action', async () => {
    await platform.sendSenderAction({
      recipientId: '123',
      action: 'typing_on',
    });

    expect(request.post).toHaveBeenCalledTimes(1);
    // $FlowMissingDefinition
    expect(request.post).toHaveBeenLastCalledWith({
      url: sendApiUrl,
      form: {
        recipient: { id: '123' },
        sender_action: 'typing_on',
      },
    });
  });

  it('catches error if sending a sender action fails', async () => {
    request.post.mockImplementationOnce(() => Promise.reject(new Error()));

    await platform.sendSenderAction({
      recipientId: '123',
      action: 'typing_on',
    });

    expect(logger.error).toHaveBeenCalled();
  });

  it('sets greeting text', async () => {
    await platform.setGreetingText('test');

    expect(request.post).toHaveBeenCalledTimes(1);
    // $FlowMissingDefinition
    expect(request.post).toHaveBeenLastCalledWith({
      url: threadSettingsUrl,
      form: {
        setting_type: 'greeting',
        greeting: { text: 'test' },
      },
    });
  });

  it('propagates error if setting greeting text fails', async () => {
    request.post.mockImplementationOnce(() => Promise.reject(new Error()));

    try {
      await platform.setGreetingText('test');
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
    }

    expect(logger.error).toHaveBeenCalled();
  });

  it('fetches a user profile', async () => {
    await platform.getUserProfile('123');

    expect(request.get).toHaveBeenCalledTimes(1);
    // $FlowMissingDefinition
    expect(request.get).toHaveBeenLastCalledWith({
      url: urlForUserProfileRequest('123'),
      qs: {
        fields: JSON.stringify([
          'first_name', 'last_name', 'profile_pic',
          'locale', 'timezone', 'gender',
        ]),
      },
    });
  });

  it('catches error if fetching a user profile fails', async () => {
    request.get.mockImplementationOnce(() => Promise.reject(new Error()));

    await platform.getUserProfile('123');

    expect(logger.error).toHaveBeenCalled();
  });
});
