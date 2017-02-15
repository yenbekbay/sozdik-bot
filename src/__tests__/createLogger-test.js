/* @flow */

import _ from 'lodash/fp';

import createLogger, {__winstonLogger} from '../createLogger';

jest.unmock('../createLogger');
jest.mock('winston', () => ({
  Logger: () => ({
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
  }),
  transports: {
    Console: jest.fn(),
  },
}));
jest.mock('winston-papertrail', () => ({
  Papertrail: jest.fn(),
}));

describe('createLogger', () => {
  let logger;

  beforeAll(() => {
    logger = createLogger('test');
  });

  it('passes log calls to winston', () => {
    const logLevels = ['error', 'warn', 'debug', 'info'];

    _.forEach(
      (level: string) => {
        logger[level](`${level} message`);
      },
      logLevels,
    );
    _.forEach(
      (level: string) => {
        expect(__winstonLogger[level]).toHaveBeenCalledTimes(1);
        // $FlowMissingDefinition
        expect(__winstonLogger[level]).toHaveBeenLastCalledWith(
          '[test]',
          `${level} message`,
        );
      },
      logLevels,
    );
  });
});
