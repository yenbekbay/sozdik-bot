/* @flow */

import {Papertrail} from 'winston-papertrail';
import _ from 'lodash/fp';
import winston from 'winston';

import config from 'src/config';

export type LogFnType = (...data: Array<any>) => void;
export type LoggerType = {|
  error: LogFnType,
  warn: LogFnType,
  debug: LogFnType,
  info: LogFnType,
  stream: {
    write: (message: string) => void,
  },
|};

const papertrailEnabled =
  config.isProduction &&
  typeof config.papertrailHost === 'string' &&
  typeof config.papertrailPort === 'string';

const winstonLogger = new winston.Logger({
  rewriters: [
    (level: string, message: string, meta: {[key: string]: any}) =>
      _.isEmpty(meta.tags) ? _.omit(['tags'], meta) : meta,
  ],
  transports: _.compact([
    new winston.transports.Console({
      level: 'debug',
      colorize: true,
    }),
    papertrailEnabled &&
      new Papertrail({
        host: config.papertrailHost,
        port: config.papertrailPort,
        hostname: 'sozdik-bot',
        inlineMeta: true,
        logFormat: (level: string, message: string): string =>
          `[${level}] ${message}`,
      }),
  ]),
});

const logLevels = ['error', 'warn', 'debug', 'info'];

const makeLogger = (source: string): LoggerType => {
  const logger = _.flow(
    _.map((level: string): LogFnType => (...data: Array<any>) => {
      winstonLogger[level](`[${source}]`, ...data);
    }),
    // $FlowFixMe
    (_.zipObject(logLevels): {
      error: LogFnType,
      warn: LogFnType,
      debug: LogFnType,
      info: LogFnType,
    }),
  )(logLevels);
  logger.stream = {
    write: (message: string) => {
      logger.info(message.trim());
    },
  };

  return logger;
};

export {winstonLogger as __winstonLogger};
export default makeLogger;
