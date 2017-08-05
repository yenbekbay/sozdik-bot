/* @flow */

import bodyParser from 'body-parser';
import express from 'express';
import morgan from 'morgan';
import type {$Request, $Response} from 'express';

import {telegramBot} from 'src/telegram';
import {messengerBot} from 'src/messenger';
import config from 'src/config';
import makeLogger from 'src/utils/makeLogger';

const logger = makeLogger('server');

const server = express();

server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: true}));
server.use(
  morgan(':method :url HTTP/:http-version :status - :response-time ms', {
    stream: logger.stream,
  }),
);

server.post(config.telegramWebhookUrl, ({body}: $Request, res: $Response) => {
  telegramBot.handleUpdate((body: $FlowFixMe));
  res.sendStatus(200); // eslint-disable-line no-magic-numbers
});

server.get(config.messengerWebhookUrl, ({query}: $Request, res: $Response) => {
  if (messengerBot.verifyWebhook(query)) {
    res.send(query['hub.challenge']);
  } else {
    res.sendStatus(400); // eslint-disable-line no-magic-numbers
  }
});

server.post(config.messengerWebhookUrl, ({body}: $Request, res: $Response) => {
  messengerBot.handleWebhookCallback((body: $FlowFixMe));
  res.sendStatus(200); // eslint-disable-line no-magic-numbers
});

export default server;
