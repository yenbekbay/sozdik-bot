/* @flow */

import config from 'src/config';

import createMessengerBot from '../createMessengerBot';

jest.mock('../makeMessengerPlatform', () => () => ({
  sendTextMessage: jest.fn(),
  sendSenderAction: jest.fn(),
  setGreetingText: jest.fn(),
  getUserProfile: jest.fn(),
}));
jest.mock('../makeHandleMessage', () => () => jest.fn());

describe('createMessengerBot', () => {
  let messengerBot;

  beforeAll(() => {
    messengerBot = createMessengerBot();
  });

  beforeEach(() => {
    (messengerBot.__handleMessage: any).mockClear();
  });

  it('handles webhook verification', () => {
    expect(
      messengerBot.verifyWebhook({
        'hub.mode': 'blahblahblah',
      }),
    ).toBe(false);
    expect(
      messengerBot.verifyWebhook({
        'hub.mode': 'subscribe',
        'hub.verify_token': 'blahblahblah',
      }),
    ).toBe(false);
    expect(
      messengerBot.verifyWebhook({
        'hub.mode': 'subscribe',
        'hub.verify_token': config.fbWebhookVerifyToken,
      }),
    ).toBe(true);
  });

  it('handles message webhook callbacks', () => {
    messengerBot.handleWebhookCallback({
      entry: [
        {
          messaging: [
            {
              sender: {id: '123'},
              message: {
                text: 'test',
              },
            },
          ],
        },
      ],
    });

    expect(messengerBot.__handleMessage).toHaveBeenCalledTimes(1);
  });

  it("doesn't handle unsupported webhook callbacks", () => {
    messengerBot.handleWebhookCallback({
      entry: [
        {
          messaging: [
            {
              sender: {id: '123'},
            },
          ],
        },
      ],
    });

    expect(messengerBot.__handleMessage).not.toHaveBeenCalled();
  });

  it('runs setup', () => {
    messengerBot.setUp();

    expect(messengerBot.__platform.setGreetingText).toHaveBeenCalled();
  });
});
