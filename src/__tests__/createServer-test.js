/* @flow */

import request from 'supertest-as-promised';

import createLogger from '../createLogger';
import createServer from '../createServer';
import env from '../env';

jest.mock('../telegram', () => ({
  createTelegramBot: () => ({
    setWebhook: jest.fn(() => Promise.resolve()),
    handleUpdate: jest.fn(),
  }),
}));
jest.mock('../messenger', () => ({
  createMessengerBot: () => ({
    setGreetingText: jest.fn(() => Promise.resolve()),
    verifyWebhook: jest.fn(() => true),
    handleWebhookCallback: jest.fn(),
  }),
}));

const {telegramWebhookUrl, messengerWebhookUrl} = env;
const logger = createLogger('test');

describe('createServer', () => {
  let server;
  let telegramBot;
  let messengerBot;

  beforeAll(() => {
    ({server, telegramBot, messengerBot} = createServer(logger));
  });

  beforeEach(() => {
    (telegramBot.handleUpdate: any).mockClear();
    (messengerBot.verifyWebhook: any).mockClear();
    (messengerBot.handleWebhookCallback: any).mockClear();
  });

  it('handles telegram bot updates', async () => {
    const sampleUpdate = {message: {}};

    await request(server)
      .post(telegramWebhookUrl)
      .send(sampleUpdate)
      .expect(200);

    expect(telegramBot.handleUpdate).toHaveBeenCalledWith(sampleUpdate);
  });

  it('handles successful messenger bot webhook verification', async () => {
    const sampleQuery = {'hub.challenge': '123456789'};

    const res = await request(server)
      .get(messengerWebhookUrl)
      .query(sampleQuery)
      .expect(200);

    expect(res.text).toBe(sampleQuery['hub.challenge']);
    expect(messengerBot.verifyWebhook).toHaveBeenCalledWith(sampleQuery);
  });

  it('handles failed messenger bot webhook verification', async () => {
    (messengerBot.verifyWebhook: any).mockImplementationOnce(() => false);

    await request(server).get(messengerWebhookUrl).expect(400);

    expect(messengerBot.verifyWebhook).toHaveBeenCalled();
  });

  it('handles messenger bot webhook callbacks', async () => {
    const sampleCallback = {entry: []};

    await request(server)
      .post(messengerWebhookUrl)
      .send(sampleCallback)
      .expect(200);

    expect(messengerBot.handleWebhookCallback).toHaveBeenCalledWith(
      sampleCallback,
    );
  });
});
