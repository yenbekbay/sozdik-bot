/* @flow */

import bodyParser from 'body-parser';
import express from 'express';
import morgan from 'morgan';
import type {$Request, $Response} from 'express';

import {createTelegramBot} from './telegram';
import {createMessengerBot} from './messenger';
import env from './env';
import type {Logger} from './createLogger';

const {telegramWebhookUrl, messengerWebhookUrl} = env;

const createServer = (logger: Logger) => {
  const server = express();
  const telegramBot = createTelegramBot();
  const messengerBot = createMessengerBot();

  server.use(bodyParser.json());
  server.use(bodyParser.urlencoded({extended: true}));
  server.use(
    morgan(':method :url HTTP/:http-version :status - :response-time ms', {
      stream: logger.stream,
    }),
  );

  server.post(telegramWebhookUrl, ({body}: $Request, res: $Response) => {
    telegramBot.handleUpdate((body: any));
    res.sendStatus(200);
  });

  server.get(messengerWebhookUrl, ({query}: $Request, res: $Response) => {
    if (messengerBot.verifyWebhook(query)) {
      res.send(query['hub.challenge']);
    } else {
      res.sendStatus(400);
    }
  });

  server.post(messengerWebhookUrl, ({body}: $Request, res: $Response) => {
    messengerBot.handleWebhookCallback((body: any));
    res.sendStatus(200);
  });

  return {
    server,
    telegramBot,
    messengerBot,
  };
};

export default createServer;
