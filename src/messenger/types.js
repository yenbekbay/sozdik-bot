/* @flow */

export type Message = {
  text: string,
};
export type Messaging = {
  sender: {id: string},
  message?: Message,
};
