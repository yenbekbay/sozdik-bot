/* @flow */

import config from 'src/config';
import MessengerPlatform from 'src/services/MessengerPlatform';

import messengerBot from '../messengerBot';
import handleMessage from '../handleMessage';

jest.mock('../../services/MessengerPlatform');
jest.mock('../handleMessage', () => jest.fn(() => Promise.resolve()));

describe('messengerBot', () => {
  beforeEach(() => {
    (handleMessage: $FlowFixMe).mockClear();
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

    expect(handleMessage).toHaveBeenCalledTimes(1);
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

    expect(handleMessage).not.toHaveBeenCalled();
  });

  it('runs setup', () => {
    messengerBot.setUp();

    expect(MessengerPlatform.setGreetingText).toHaveBeenCalled();
  });
});
