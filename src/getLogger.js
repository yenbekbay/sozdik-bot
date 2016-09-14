/* @flow */

import _ from 'lodash/fp';
import winston from 'winston';
import 'winston-papertrail';

import env from './env';

const { papertrailOptions } = env;

export type LogFn = (...data: Array<any>) => void;
export type Logger = {
  error: LogFn,
  warn: LogFn,
  debug: LogFn,
  info: LogFn
};

const logger = new winston.Logger({
  rewriters: [
    (level: string, message: string, meta: Object): Object => (
      _.isEmpty(meta.tags)
        ? _.omit(['tags'])(meta)
        : meta
    ),
  ],
  transports: [
    new winston.transports.Console({
      level: 'debug',
      colorize: true,
    }),
    papertrailOptions && new winston.transports.Papertrail({
      ...papertrailOptions,
      hostname: 'sozdik-bot',
      inlineMeta: true,
      logFormat: (
        level: string,
        message: string,
      ): string => `[${level}] ${message}`,
    }),
  ],
});

const logLevels = ['error', 'warn', 'debug', 'info'];
const getLogger = (tags: Array<string> = []): Logger => _.flow(
  _.map((level: string): LogFn => (...data: Array<any>) => {
    logger[level](...data, { tags });
  }),
  _.zipObject(logLevels),
)(logLevels);

export default getLogger;
