/* @flow */

import localtunnel from 'localtunnel';

import createLogger from './createLogger';
import createServer from './createServer';
import env from './env';

const { port, tunnelOptions, telegramWebhookUrl, prodUrl, isProd } = env;
const logger = createLogger('server');
const { server, telegramBot, messengerBot } = createServer(logger);

const setUpBots = (serverUrl: string) => {
  telegramBot
    .setUp(`${serverUrl}${telegramWebhookUrl}`)
    .catch((err: Error) => {
      throw err;
    });
  messengerBot.setUp();
};

server.listen(port, () => {
  logger.info(`Started server on port ${port}`);

  if (isProd) {
    setUpBots(prodUrl);
  } else {
    const tunnel = localtunnel(port, tunnelOptions, (err: ?Error) => {
      if (err) {
        logger.error(
          'Failed to request a tunnel for the server:',
          err.message,
        );

        throw err;
      }

      logger.info(`Created a tunnel to server at ${tunnel.url}`);

      setUpBots(tunnel.url.replace(/^http:/, 'https:'));
    });

    tunnel.on('close', () => {
      logger.error('Tunnel to server closed');

      throw new Error('Tunnel to server closed');
    });
  }
});
