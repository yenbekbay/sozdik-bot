/* eslint-disable import/no-extraneous-dependencies */

const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('babel-register');

const chai = require('chai');
const dirtyChai = require('dirty-chai');

chai.config.truncateThreshold = 0;
chai.use(dirtyChai);
