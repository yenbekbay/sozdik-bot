/* @flow */

const requestMethod = () => jest.fn(() => Promise.resolve({}));

const request = {
  ...requestMethod(),
  get: requestMethod(),
  post: requestMethod(),
};

const rp = {
  defaults: () => request,
  ...request,
};

export default rp;
