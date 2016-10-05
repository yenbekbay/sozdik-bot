/* @flow */

/* eslint-disable import/imports-first */

jest.mock('../messengerPlatform', () => () => ({
  sendTextMessage: jest.fn(),
  sendSenderAction: jest.fn(),
  setGreetingText: jest.fn(),
  getUserProfile: jest.fn(),
}));
jest.mock('../handleMessage', () => () => jest.fn());

import createMessengerBot from '../createMessengerBot';
import env from '../../env';

describe('createTelegramBot', () => {
  let messengerBot;

  beforeAll(() => {
    messengerBot = createMessengerBot();
  });

  beforeEach(() => {
    (messengerBot.__handleMessage: any).mockClear();
  });

  it('exposes "setGreetingText" method', () => {
    expect(messengerBot.setGreetingText)
      .toBe(messengerBot.__platform.setGreetingText);
  });

  it('handles webhook verification', () => {
    expect(messengerBot.verifyWebhook({
      'hub.mode': 'blahblahblah',
    })).toBe(false);
    expect(messengerBot.verifyWebhook({
      'hub.mode': 'subscribe',
      'hub.verify_token': 'blahblahblah',
    })).toBe(false);
    expect(messengerBot.verifyWebhook({
      'hub.mode': 'subscribe',
      'hub.verify_token': env.fbWebhookVerifyToken,
    })).toBe(true);
  });

  it('handles message webhook callbacks', () => {
    messengerBot.handleWebhookCallback({
      entry: [{
        messaging: [{
          sender: { id: '123' },
          message: {
            text: 'test',
          },
        }],
      }],
    });

    // $FlowMissingDefinition
    expect(messengerBot.__handleMessage).toHaveBeenCalledTimes(1);
  });

  it('doesn\'t handle unsupported webhook callbacks', () => {
    messengerBot.handleWebhookCallback({
      entry: [{
        messaging: [{
          sender: { id: '123' },
        }],
      }],
    });

    expect(messengerBot.__handleMessage).not.toHaveBeenCalled();
  });
});
