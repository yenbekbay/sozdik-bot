/* @flow */

const TelegramBotApi = {
  sendMessage: jest.fn(() => Promise.resolve()),
  sendChatAction: jest.fn(() => Promise.resolve()),
  answerInlineQuery: jest.fn(() => Promise.resolve()),
  setWebhook: jest.fn(() => Promise.resolve()),
};

export default TelegramBotApi;
