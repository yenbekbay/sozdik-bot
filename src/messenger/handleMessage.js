/* @flow */

import _ from 'lodash/fp';
import removeMarkdown from 'remove-markdown';

import Analytics from 'src/services/Analytics';
import config from 'src/config';
import getSozdikApi from 'src/services/getSozdikApi';
import makeLogger from 'src/utils/makeLogger';
import MessengerPlatform from 'src/services/MessengerPlatform';
import type {MessengerMessageType} from 'src/services/MessengerPlatform';
import type {TranslationType} from 'src/services/getSozdikApi';

const logger = makeLogger('messenger/handleMessage');
const sozdikApi = getSozdikApi('telegram');

const handleMessage = async ({
  recipientId,
  message: {text},
}: {|
  recipientId: string,
  message: MessengerMessageType,
|}) => {
  if (!text || text.length === 0) return null;

  try {
    const [user, translations] = await Promise.all([
      MessengerPlatform.getUserProfile(recipientId),
      sozdikApi.getTranslationsForQuery(text.toLowerCase()),
      MessengerPlatform.sendSenderAction({recipientId, action: 'typing_on'}),
    ]);

    const userInfo = {
      id: recipientId,
      ...(user ? _.pick(['first_name', 'last_name'], user) : {}),
    };

    logger.info(
      `Translating "${text.toLowerCase()}" for user`,
      JSON.stringify(userInfo),
    );

    await Promise.all([
      Analytics.trackUser({id: recipientId, ...user}),
      Analytics.trackEvent(recipientId, 'Requested translations', {
        query: text,
        kk_translation: !!_.find({toLang: 'kk'}, translations),
        ru_translation: !!_.find({toLang: 'ru'}, translations),
      }),
    ]);

    return translations.length
      ? await Promise.all(
          _.map(
            (translation: TranslationType) =>
              MessengerPlatform.sendTextMessage({
                recipientId,
                text: _.truncate(
                  {length: 320, omission: `...\n${translation.url}`},
                  (removeMarkdown(
                    `${translation.title}:\n${translation.text}`,
                  ): string),
                ),
              }),
            translations,
          ),
        )
      : await MessengerPlatform.sendTextMessage({
          recipientId,
          text: config.noTranslationsFoundText,
        });
  } catch (err) {
    logger.error(
      `Failed to reply to a message from user ${recipientId}: ${err.message}`,
    );

    return MessengerPlatform.sendTextMessage({
      recipientId,
      text: config.errorText,
    });
  }
};

export default handleMessage;
export {logger as __logger};
