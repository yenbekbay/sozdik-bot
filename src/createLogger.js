/* @flow */

import {Papertrail} from 'winston-papertrail';
import _ from 'lodash/fp';
import winston from 'winston';

import env from './env';

const {papertrailOptions} = env;

export type LogFn = (...data: Array<any>) => void;
export type Logger = {
  error: LogFn,
  warn: LogFn,
  debug: LogFn,
  info: LogFn,
  stream: {
    write: (message: string) => void,
  },
};

const winstonLogger = new winston.Logger({
  rewriters: [
    (level: string, message: string, meta: Object): Object =>
      _.isEmpty(meta.tags) ? _.omit(['tags'])(meta) : meta,
  ],
  transports: _.compact([
    new winston.transports.Console({
      level: 'debug',
      colorize: true,
    }),
    papertrailOptions.host &&
      papertrailOptions.port &&
      new Papertrail({
        ...papertrailOptions,
        hostname: 'sozdik-bot',
        inlineMeta: true,
        logFormat: (level: string, message: string): string =>
          `[${level}] ${message}`,
      }),
  ]),
});

const logLevels = ['error', 'warn', 'debug', 'info'];
const createLogger = (source: string): Logger => {
  const logger = _.flow(
    _.map((level: string): LogFn => (...data: Array<any>) => {
      winstonLogger[level](`[${source}]`, ...data);
    }),
    _.zipObject(logLevels),
  )(logLevels);
  logger.stream = {
    write: (message: string) => {
      logger.info(message.trim());
    },
  };

  return logger;
};

export {winstonLogger as __winstonLogger};
export default createLogger;
