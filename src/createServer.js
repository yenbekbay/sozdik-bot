/* @flow */

import bodyParser from 'body-parser';
import express from 'express';
import morgan from 'morgan';
import type {$Request, $Response} from 'express';

import {createTelegramBot} from 'src/telegram';
import {createMessengerBot} from 'src/messenger';
import config from 'src/config';
import type {LoggerType} from 'src/makeLogger';

const createServer = (logger: LoggerType) => {
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

  server.post(config.telegramWebhookUrl, ({body}: $Request, res: $Response) => {
    telegramBot.handleUpdate((body: any));
    res.sendStatus(200); // eslint-disable-line no-magic-numbers
  });

  server.get(
    config.messengerWebhookUrl,
    ({query}: $Request, res: $Response) => {
      if (messengerBot.verifyWebhook(query)) {
        res.send(query['hub.challenge']);
      } else {
        res.sendStatus(400); // eslint-disable-line no-magic-numbers
      }
    },
  );

  server.post(
    config.messengerWebhookUrl,
    ({body}: $Request, res: $Response) => {
      messengerBot.handleWebhookCallback((body: any));
      res.sendStatus(200); // eslint-disable-line no-magic-numbers
    },
  );

  return {
    server,
    telegramBot,
    messengerBot,
  };
};

export default createServer;
