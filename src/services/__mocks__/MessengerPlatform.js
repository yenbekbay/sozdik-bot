const MessengerPlatform = {
  sendTextMessage: jest.fn(() => Promise.resolve()),
  sendSenderAction: jest.fn(() => Promise.resolve()),
  setGreetingText: jest.fn(() => Promise.resolve()),
  getUserProfile: jest.fn(() =>
    Promise.resolve({
      first_name: '',
      last_name: '',
    }),
  ),
};

export default MessengerPlatform;
