/* @flow */

export type MessageType = {
  text: string,
};
export type MessagingType = {
  sender: {id: string},
  message?: MessageType,
};
