module.exports = {
  extends: [
    'anvilabs',
    'anvilabs/flowtype',
    'anvilabs/jest',
    'anvilabs/lodash',
  ],
  rules: {
    'no-magic-numbers': 0,

    'promise/prefer-await-to-then': 0,
  },
};
