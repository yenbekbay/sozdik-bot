/* @flow */

import _ from 'lodash/fp';

import type { Logger } from '../getLogger';

const getLogger = (): Logger => ({
  error: _.noop,
  warn: _.noop,
  debug: _.noop,
  info: _.noop,
});

export default getLogger;
