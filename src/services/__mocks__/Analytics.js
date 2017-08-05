/* @flow */

const mixpanel = {};
const Analytics = {
  trackUser: jest.fn(() => Promise.resolve()),
  trackEvent: jest.fn(() => Promise.resolve()),
};

export default Analytics;
export {mixpanel as __mixpanel};
