/* @flow */

import type { Logger } from '../createLogger';

const createLogger = (): Logger => ({
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  stream: { write: jest.fn() },
});

export default createLogger;
