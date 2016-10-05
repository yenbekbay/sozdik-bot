/* @flow */

export type ThreadSettingType = 'greeting' | 'call_to_actions';
export type UserProfile = {
  first_name?: ?string,
  last_name?: ?string,
  profile_pic?: ?string,
  locale: string,
  timezone: number,
  gender?: ?string,
};
export type Message = {
  text: string,
};
export type Messaging = {
  sender: { id: string },
  message?: Message,
};
