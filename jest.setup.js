const dotenv = require('dotenv');

if (!('CI' in process.env)) {
  dotenv.config();
}

jest.mock('request-promise');

jest.mock('./src/createLogger');
jest.mock('./src/analytics');
jest.mock('./src/sozdikApi');
