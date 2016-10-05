/* @flow */

const mixpanel = {};
const trackUser = jest.fn(() => Promise.resolve());
const trackEvent = jest.fn(() => Promise.resolve());

export { mixpanel, trackUser, trackEvent };
