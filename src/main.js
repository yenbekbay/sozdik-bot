/* @flow */

import localtunnel from 'localtunnel';

import {telegramBot} from 'src/telegram';
import {messengerBot} from 'src/messenger';
import makeLogger from 'src/utils/makeLogger';
import server from 'src/server';
import config from 'src/config';

const logger = makeLogger('main');

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
            `Failed to request a tunnel for the server: ${err.message}`,
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
