/* @flow */

const requestMethod = () => jest.fn(() => Promise.resolve({}));

const request = requestMethod();
(request: any).get = requestMethod();
(request: any).post = requestMethod();

const rp = {
  defaults: () => request,
  ...request,
};

export default rp;
