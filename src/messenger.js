/* @flow */

import {
  GreetingText,
  Messenger as MessengerBot,
} from 'fbmessenger';
import _ from 'lodash/fp';
import bodyParser from 'body-parser';
import express from 'express';
import localtunnel from 'localtunnel';
import removeMarkdown from 'remove-markdown';
import type { $Request, $Response } from 'express';

import { getTranslationsForQuery } from './sozdikApi';
import { trackUser, trackEvent } from './analytics';
import env from './env';
import getLogger from './getLogger';
import type { Translation } from './sozdikApi';

type Message = {
  sender: { id: string },
  recipient: { id: string },
  timestamp: number,
  message: {
    mid: string,
    seq: number,
    text: string
  }
};

const { fbPageAccessToken, fbWebhookVerifyToken } = env;
const tunnelOptions = { subdomain: 'sozdikbotfb' };
const port = 8080;

const logger = getLogger(['messenger']);
const bot = new MessengerBot({ pageAccessToken: fbPageAccessToken });
const server = express();

bot.setThreadSetting(new GreetingText(
  'Просто введи слово, фразу или число, и я переведу.',
));

const sendText = (userId: string, text: string): Promise<void> => bot
  .send({ text }, userId)
  .then(
    () => {
      logger.debug(`Sent a message to user ${userId}`);

      return;
    },
    (err: Error) => {
      logger.error(
        `Failed to send a message to user ${userId}: ${err.message}`,
      );

      throw err;
    },
  );
const senderAction = (
  userId: string,
  action: 'typing_on',
): Promise<void> => bot
  .senderAction(action, userId)
  .then(
    () => {
      logger.debug(`Sent a ${action} action to user ${userId}`);

      return;
    },
    (err: Error) => {
      logger.error(
        `Failed to send a ${action} action to user ${userId}: ${err.message}`,
      );

      throw err;
    },
  );

bot.on('message', async (
  { sender, message: { text } }: Message,
): Promise<void> => {
  const [user, translations] = await Promise.all([
    bot.client.getUser(sender.id),
    getTranslationsForQuery(text.toLowerCase()),
    senderAction(sender.id, 'typing_on'),
  ]);

  await Promise.all([
    trackUser({ id: sender.id, ...user }),
    trackEvent(sender.id, 'Requested translations', {
      query: text,
      kk_translation: !!_.find({ toLang: 'kk' })(translations),
      ru_translation: !!_.find({ toLang: 'ru' })(translations),
    }),
  ]);

  if (translations.length) {
    await Promise.all(_.map(
      (translation: Translation): Promise<void> => sendText(
        sender.id,
        _.truncate(
          { length: 320, omission: `...\n${translation.url}` },
        )(removeMarkdown(`${translation.title}:\n${translation.text}`)),
      ),
    )(translations));
  } else {
    await sendText(
      sender.id,
      'К сожалению, я не знаю, как это перевести 😔',
    );
  }
});

server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

server.get('/webhook', (req: $Request, res: $Response) => {
  if (
    req.query['hub.mode'] === 'subscribe' &&
    req.query['hub.verify_token'] === fbWebhookVerifyToken
  ) {
    res.send(req.query['hub.challenge']);
  } else {
    res.sendStatus(400);
  }
});

server.post('/webhook', (req: $Request, res: $Response) => {
  res.sendStatus(200);
  bot.handle(req.body);
});

server.listen(port, () => {
  logger.info(`Started messenger webserver on port ${port}`);

  const tunnel = localtunnel(
    port,
    tunnelOptions,
    (err: ?Error) => {
      if (err) {
        logger.error(
          `Failed to request a tunnel for the server: ${err.message}`,
        );

        process.exit(1);
      }

      logger.info(`Created a tunnel to messenger webserver at ${tunnel.url}`);
    },
  );

  tunnel.on('close', () => {
    logger.error('Total to the server closed');
    process.exit(1);
  });
});
