/* @flow */

import request from 'supertest-as-promised';

import config from 'src/config';

import {messengerBot} from '../messenger';
import {telegramBot} from '../telegram';
import server from '../server';

jest.mock('../telegram', () => ({
  telegramBot: {
    setWebhook: jest.fn(() => Promise.resolve()),
    handleUpdate: jest.fn(),
  },
}));
jest.mock('../messenger', () => ({
  messengerBot: {
    setGreetingText: jest.fn(() => Promise.resolve()),
    verifyWebhook: jest.fn(() => true),
    handleWebhookCallback: jest.fn(),
  },
}));

describe('server', () => {
  beforeEach(() => {
    (telegramBot.handleUpdate: $FlowFixMe).mockClear();
    (messengerBot.verifyWebhook: $FlowFixMe).mockClear();
    (messengerBot.handleWebhookCallback: $FlowFixMe).mockClear();
  });

  it('handles telegram bot updates', async () => {
    const sampleUpdate = {message: {}};

    await request(server)
      .post(config.telegramWebhookUrl)
      .send(sampleUpdate)
      .expect(200); // eslint-disable-line no-magic-numbers

    expect(telegramBot.handleUpdate).toHaveBeenCalledWith(sampleUpdate);
  });

  it('handles successful messenger bot webhook verification', async () => {
    const sampleQuery = {'hub.challenge': '123456789'};

    const res = await request(server)
      .get(config.messengerWebhookUrl)
      .query(sampleQuery)
      .expect(200); // eslint-disable-line no-magic-numbers

    expect(res.text).toBe(sampleQuery['hub.challenge']);
    expect(messengerBot.verifyWebhook).toHaveBeenCalledWith(sampleQuery);
  });

  it('handles failed messenger bot webhook verification', async () => {
    (messengerBot.verifyWebhook: $FlowFixMe).mockImplementationOnce(
      () => false,
    );

    await request(server).get(config.messengerWebhookUrl).expect(400); // eslint-disable-line no-magic-numbers

    expect(messengerBot.verifyWebhook).toHaveBeenCalled();
  });

  it('handles messenger bot webhook callbacks', async () => {
    const sampleCallback = {entry: []};

    await request(server)
      .post(config.messengerWebhookUrl)
      .send(sampleCallback)
      .expect(200); // eslint-disable-line no-magic-numbers

    expect(messengerBot.handleWebhookCallback).toHaveBeenCalledWith(
      sampleCallback,
    );
  });
});
