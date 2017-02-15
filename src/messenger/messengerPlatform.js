/* @flow */

import rp from 'request-promise';

import env from '../env';
import type {Logger} from '../createLogger';

export type ThreadSettingType = 'greeting' | 'call_to_actions';
export type UserProfile = {
  first_name?: ?string,
  last_name?: ?string,
  profile_pic?: ?string,
  locale: string,
  timezone: number,
  gender?: ?string,
};

type SendApiMethodConfig = {recipientId: string};
type SendTextMessageConfig = SendApiMethodConfig & {text: string};
type SendSenderActionConfig =
  & SendApiMethodConfig
  & {
    action: 'mark_seen' | 'typing_on' | 'typing_off',
  };

export type SendTextMessageFn = (
  config: SendTextMessageConfig,
) => Promise<?JSON>;
export type SendSenderActionFn = (
  config: SendSenderActionConfig,
) => Promise<?JSON>;
export type SetGreetingTextFn = (text: string) => Promise<JSON>;
export type GetUserProfileFn = (userId: string) => Promise<?UserProfile>;

const {fbPageAccessToken} = env;
const graphApiUrl = 'https://graph.facebook.com/v2.6';
const sendApiUrl = `${graphApiUrl}/me/messages`;
const threadSettingsUrl = `${graphApiUrl}/me/thread_settings`;
const urlForUserProfileRequest = (userId: string) => `${graphApiUrl}/${userId}`;

const request = rp.defaults({
  headers: {'User-Agent': 'sozdik-bot'},
  qs: {access_token: fbPageAccessToken},
  gzip: true,
  json: true,
});
const sendApiRequest = (
  recipientId: string,
  payload: {[key: string]: mixed},
): Promise<JSON> =>
  request.post({
    url: sendApiUrl,
    form: {
      recipient: {id: recipientId},
      ...payload,
    },
  });
const threadSettingsRequest = (
  settingType: ThreadSettingType,
  payload: {[key: string]: mixed},
): Promise<JSON> =>
  request.post({
    url: threadSettingsUrl,
    form: {
      setting_type: settingType,
      ...payload,
    },
  });

const messengerPlatform = (logger: Logger) => ({
  sendTextMessage: ({recipientId, text}: SendTextMessageConfig) =>
    sendApiRequest(recipientId, {message: {text}}).then(
      (response: JSON) => {
        logger.debug(`Sent a message to user ${recipientId}`);

        return response;
      },
      (err: Error) => {
        logger.error(
          `Failed to send a message to user ${recipientId}:`,
          err.message,
        );
      },
    ),
  sendSenderAction: ({recipientId, action}: SendSenderActionConfig) =>
    sendApiRequest(recipientId, {sender_action: action}).then(
      (response: JSON) => {
        logger.debug(`Sent a ${action} action to user ${recipientId}`);

        return response;
      },
      (err: Error) => {
        logger.error(
          `Failed to send a ${action} action to user ${recipientId}:`,
          err.message,
        );
      },
    ),
  setGreetingText: (text: string) => threadSettingsRequest('greeting', {
    greeting: {text},
  }).then(
    (response: JSON) => {
      logger.debug(`Updated greeting text thread settings to "${text}"`);

      return response;
    },
    (err: Error) => {
      logger.error(
        `Failed to update greeting text thread setting to "${text}":`,
        err.message,
      );

      throw err;
    },
  ),
  getUserProfile: (userId: string) => request
    .get({
      url: urlForUserProfileRequest(userId),
      qs: {
        fields: JSON.stringify([
          'first_name',
          'last_name',
          'profile_pic',
          'locale',
          'timezone',
          'gender',
        ]),
      },
    })
    .then(
      (response: JSON) => {
        logger.debug(
          `Got profile for user ${userId}:`,
          JSON.stringify(response),
        );

        return response;
      },
      (err: Error) => {
        logger.error(`Failed to get profile for user ${userId}:`, err.message);

        return null;
      },
    ),
});

export {request, sendApiUrl, threadSettingsUrl, urlForUserProfileRequest};
export default messengerPlatform;
