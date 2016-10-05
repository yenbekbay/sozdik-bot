/* @flow */

import bodyParser from 'body-parser';
import express from 'express';
import localtunnel from 'localtunnel';
import morgan from 'morgan';
import type { $Request, $Response } from 'express';

import { createTelegramBot } from './telegram';
import { createMessengerBot } from './messenger';
import env from './env';
import createLogger from './createLogger';

const { telegramBotToken, port, tunnelOptions, isProd } = env;
const logger = createLogger('server');
const telegramWebhookUrl = `/telegram${telegramBotToken}`;
const messengerWebhookUrl = '/messenger';

const server = express();
const telegramBot = createTelegramBot();
const messengerBot = createMessengerBot();

server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(morgan(isProd ? 'combined' : 'dev', { stream: logger.stream }));

server.post(telegramWebhookUrl, ({ body }: $Request, res: $Response) => {
  if (body && typeof body === 'object') {
    telegramBot.handleUpdate(body);
  }

  res.sendStatus(200);
});

server.get(messengerWebhookUrl, ({ query }: $Request, res: $Response) => {
  if (messengerBot.verifyWebhook(query)) {
    res.send(query['hub.challenge']);
  } else {
    res.sendStatus(400);
  }
});

server.post(messengerWebhookUrl, ({ body }: $Request, res: $Response) => {
  if (body && typeof body === 'object') {
    messengerBot.handleWebhookCallback(body);
  }

  res.sendStatus(200);
});

server.listen(port, () => {
  logger.info(`Started server on port ${port}`);

  const tunnel = localtunnel(port, tunnelOptions, (err: ?Error) => {
    if (err) {
      logger.error(
        'Failed to request a tunnel for the server:',
        err.message,
      );

      process.exit(1);
    }

    logger.info(`Created a tunnel to server at ${tunnel.url}`);

    telegramBot
      .setWebhook(
        `${tunnel.url.replace(/^http:/, 'https:')}${telegramWebhookUrl}`,
      )
      .then(() => {
        process.on('exit', () => {
          telegramBot.setWebhook('');
        });

        return;
      })
      .catch(() => {
        process.exit(1);
      });
    messengerBot.setGreetingText(
      'Просто введи слово, фразу или число, и я переведу.',
    );
  });

  tunnel.on('close', () => {
    logger.error('Tunnel to server closed');
    process.exit(1);
  });
});
