/* @flow */

import type {LoggerType} from '../createLogger';

const createLogger = (): LoggerType => ({
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  stream: {write: jest.fn()},
});

export default createLogger;
