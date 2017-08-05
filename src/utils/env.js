/* @flow */

import path from 'path';

import dotenvSafe from 'dotenv-safe';

const defaultEnv = {
  NODE_ENV: 'development',
};

/* eslint-disable no-process-env */
const env = {
  required: (key: string): string => {
    const value = process.env[key];
    if (value === undefined || value === null || value === '') {
      if (key in defaultEnv) return defaultEnv[key];

      throw new Error(`Missing ${key} environment variable`);
    }

    return value;
  },
  optional: (key: string) => process.env[key],
};

if (!('CI' in process.env)) {
  dotenvSafe.load({
    path: path.resolve(__dirname, '../../.env'),
    sample: path.resolve(__dirname, '../../.env.example'),
  });
}
/* eslint-enable no-process-env */

export default env;
