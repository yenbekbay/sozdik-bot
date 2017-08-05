/* @flow */

import type {LoggerType} from '../makeLogger';

const makeLogger = (): LoggerType => ({
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  stream: {write: jest.fn()},
});

export default makeLogger;
