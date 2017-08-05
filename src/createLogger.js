/* @flow */

import {Papertrail} from 'winston-papertrail';
import _ from 'lodash/fp';
import winston from 'winston';

import env from './env';

const {papertrailOptions} = env;

export type LogFnType = (...data: Array<any>) => void;
export type LoggerType = {
  error: LogFnType,
  warn: LogFnType,
  debug: LogFnType,
  info: LogFnType,
  stream: {
    write: (message: string) => void,
  },
};

const winstonLogger = new winston.Logger({
  rewriters: [
    (
      level: string,
      message: string,
      meta: {[key: string]: any},
    ): {[key: string]: any} =>
      _.isEmpty(meta.tags) ? _.omit(['tags'])(meta) : meta,
  ],
  transports: _.compact([
    new winston.transports.Console({
      level: 'debug',
      colorize: true,
    }),
    papertrailOptions.host !== undefined &&
      papertrailOptions.host !== null &&
      papertrailOptions.port !== undefined &&
      papertrailOptions.port !== null &&
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
const createLogger = (source: string): LoggerType => {
  const logger = _.flow(
    _.map((level: string): LogFnType => (...data: Array<any>) => {
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
