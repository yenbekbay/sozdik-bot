/* @flow */

import rp from 'request-promise';

import config from 'src/config';
import type {LoggerType} from 'src/createLogger';

export type ThreadSettingTypeType = 'greeting' | 'call_to_actions';
export type UserProfileType = {
  first_name?: ?string,
  last_name?: ?string,
  profile_pic?: ?string,
  locale: string,
  timezone: number,
  gender?: ?string,
};

type SendApiMethodConfigType = {recipientId: string};
type SendTextMessageConfigType = SendApiMethodConfigType & {text: string};
type SendSenderActionConfigType = SendApiMethodConfigType & {
  action: 'mark_seen' | 'typing_on' | 'typing_off',
};

export type SendTextMessageFnType = (
  config: SendTextMessageConfigType,
) => Promise<?{[key: string]: any}>;
export type SendSenderActionFnType = (
  config: SendSenderActionConfigType,
) => Promise<?{[key: string]: any}>;
export type SetGreetingTextFnType = (
  text: string,
) => Promise<{[key: string]: any}>;
export type GetUserProfileFnType = (
  userId: string,
) => Promise<?UserProfileType>;

const graphApiUrl = 'https://graph.facebook.com/v2.6';
const sendApiUrl = `${graphApiUrl}/me/messages`;
const threadSettingsUrl = `${graphApiUrl}/me/thread_settings`;
const urlForUserProfileRequest = (userId: string) => `${graphApiUrl}/${userId}`;

const request = rp.defaults({
  headers: {'User-Agent': 'sozdik-bot'},
  qs: {access_token: config.fbPageAccessToken},
  gzip: true,
  json: true,
});
const sendApiRequest = (
  recipientId: string,
  payload: {[key: string]: any},
): Promise<{[key: string]: any}> =>
  request.post({
    url: sendApiUrl,
    form: {
      recipient: {id: recipientId},
      ...payload,
    },
  });
const threadSettingsRequest = (
  settingType: ThreadSettingTypeType,
  payload: {[key: string]: any},
): Promise<{[key: string]: any}> =>
  request.post({
    url: threadSettingsUrl,
    form: {
      setting_type: settingType,
      ...payload,
    },
  });

const makeMessengerPlatform = (logger: LoggerType) => ({
  sendTextMessage: async ({recipientId, text}: SendTextMessageConfigType) => {
    try {
      const response = await sendApiRequest(recipientId, {message: {text}});

      logger.debug(`Sent a message to user ${recipientId}`);

      return response;
    } catch (err) {
      logger.error(
        `Failed to send a message to user ${recipientId}:`,
        err.message,
      );

      return null;
    }
  },
  sendSenderAction: async ({
    recipientId,
    action,
  }: SendSenderActionConfigType) => {
    try {
      const response = await sendApiRequest(recipientId, {
        sender_action: action,
      });

      logger.debug(`Sent a ${action} action to user ${recipientId}`);

      return response;
    } catch (err) {
      logger.error(
        `Failed to send a ${action} action to user ${recipientId}:`,
        err.message,
      );

      return null;
    }
  },
  setGreetingText: async (text: string) => {
    try {
      const response = await threadSettingsRequest('greeting', {
        greeting: {text},
      });

      logger.debug(`Updated greeting text thread settings to "${text}"`);

      return response;
    } catch (err) {
      logger.error(
        `Failed to update greeting text thread setting to "${text}":`,
        err.message,
      );

      throw err;
    }
  },
  getUserProfile: async (userId: string) => {
    try {
      const response = await request.get({
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
      });

      logger.debug(`Got profile for user ${userId}:`, JSON.stringify(response));

      return response;
    } catch (err) {
      logger.error(`Failed to get profile for user ${userId}:`, err.message);

      return null;
    }
  },
});

export {request, sendApiUrl, threadSettingsUrl, urlForUserProfileRequest};
export default makeMessengerPlatform;
