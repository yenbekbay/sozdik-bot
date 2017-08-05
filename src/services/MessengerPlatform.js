/* @flow */

import rp from 'request-promise';

import config from 'src/config';
import makeLogger from 'src/utils/makeLogger';

type ThreadSettingTypeType = 'greeting' | 'call_to_actions';
type UserProfileType = {
  first_name?: ?string,
  last_name?: ?string,
  profile_pic?: ?string,
  locale: string,
  timezone: number,
  gender?: ?string,
};

export type MessengerMessageType = {
  text: string,
};
export type MessengerMessagingType = {
  sender: {id: string},
  message?: MessengerMessageType,
};
export type MessengerWebhookCallbackType = {
  entry: Array<{messaging: Array<MessengerMessagingType>}>,
};

const FACEBOOK_GRAPH_QPI_URL = 'https://graph.facebook.com/v2.6';

const logger = makeLogger('messenger/MessengerPlatform');

const sendApiUrl = `${FACEBOOK_GRAPH_QPI_URL}/me/messages`;
const threadSettingsUrl = `${FACEBOOK_GRAPH_QPI_URL}/me/thread_settings`;
const urlForUserProfileRequest = (userId: string) =>
  `${FACEBOOK_GRAPH_QPI_URL}/${userId}`;

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

const MessengerPlatform = {
  sendTextMessage: async ({
    recipientId,
    text,
  }: {|
    recipientId: string,
    text: string,
  |}) => {
    try {
      const response = await sendApiRequest(recipientId, {message: {text}});

      logger.debug(`Sent a message to user ${recipientId}`);

      return response;
    } catch (err) {
      logger.error(
        `Failed to send a message to user ${recipientId}: ${err.message}`,
      );

      return null;
    }
  },
  sendSenderAction: async ({
    recipientId,
    action,
  }: {|
    recipientId: string,
    action: 'mark_seen' | 'typing_on' | 'typing_off',
  |}) => {
    try {
      const response = await sendApiRequest(recipientId, {
        sender_action: action,
      });

      logger.debug(`Sent a ${action} action to user ${recipientId}`);

      return response;
    } catch (err) {
      logger.error(
        `Failed to send a ${action} action to user ${recipientId}: ${err.message}`,
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
        `Failed to update greeting text thread setting to "${text}": ${err.message}`,
      );

      throw err;
    }
  },
  getUserProfile: async (userId: string) => {
    try {
      const response: UserProfileType = await request.get({
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
      logger.error(`Failed to get profile for user ${userId}: ${err.message}`);

      return null;
    }
  },
};

export default MessengerPlatform;
export {
  logger as __logger,
  request as __request,
  sendApiUrl as __sendApiUrl,
  threadSettingsUrl as __threadSettingsUrl,
  urlForUserProfileRequest as __urlForUserProfileRequest,
};
