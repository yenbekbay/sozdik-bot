/* @flow */

import localtunnel from 'localtunnel';

import createLogger from 'src/createLogger';
import createServer from 'src/createServer';
import config from 'src/config';

const logger = createLogger('server');
const {server, telegramBot, messengerBot} = createServer(logger);

const setUpBots = async (serverUrl: string) => {
  try {
    await telegramBot.setUp(`${serverUrl}${config.telegramWebhookUrl}`);
    messengerBot.setUp();
  } catch (err) {
    throw err;
  }
};

server.listen(config.port, () => {
  logger.info(`Started server on port ${config.port}`);

  if (config.isProduction) {
    setUpBots(config.productionUrl);
  } else {
    const tunnel = localtunnel(
      config.port,
      config.tunnelOptions,
      (err: ?Error) => {
        if (err) {
          logger.error(
            'Failed to request a tunnel for the server:',
            err.message,
          );

          throw err;
        }

        logger.info(`Created a tunnel to server at ${tunnel.url}`);

        setUpBots(tunnel.url.replace(/^http:/, 'https:'));
      },
    );

    tunnel.on('close', () => {
      logger.error('Tunnel to server closed');

      throw new Error('Tunnel to server closed');
    });
  }
});
