/* @flow */

import makeLogger, {__winstonLogger} from '../makeLogger';

jest.unmock('../makeLogger');
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

describe('makeLogger', () => {
  let logger;

  beforeAll(() => {
    logger = makeLogger('test');
  });

  it('passes log calls to winston', () => {
    const logLevels = ['error', 'warn', 'debug', 'info'];

    logLevels.forEach((level: string) => {
      logger[level](`${level} message`);
    });
    logLevels.forEach((level: string) => {
      expect(__winstonLogger[level]).toHaveBeenCalledTimes(1);
      // $FlowMissingDefinition
      expect(__winstonLogger[level]).toHaveBeenLastCalledWith(
        '[test]',
        `${level} message`,
      );
    });
  });
});
