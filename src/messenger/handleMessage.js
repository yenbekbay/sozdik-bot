/* @flow */

import _ from 'lodash/fp';
import removeMarkdown from 'remove-markdown';

import { getTranslationsForQuery } from '../sozdikApi';
import { trackUser, trackEvent } from '../analytics';
import env from '../env';
import type {
  SendTextMessageFn,
  SendSenderActionFn,
  GetUserProfileFn,
} from './messengerPlatform';
import type { Logger } from '../createLogger';
import type { Message } from './types';
import type { Translation } from '../sozdikApi';

const { noTranslationsFoundText, errorText } = env;

const handleMessage = (
  { sendTextMessage, sendSenderAction, getUserProfile, logger }: {
    sendTextMessage: SendTextMessageFn,
    sendSenderAction: SendSenderActionFn,
    getUserProfile: GetUserProfileFn,
    logger: Logger,
  },
) => async (
  { recipientId, message: { text } }: { recipientId: string, message: Message },
): Promise<?JSON> => {
  if (!text || !text.length) return null;

  try {
    const [user, translations] = await Promise.all([
      getUserProfile(recipientId),
      getTranslationsForQuery(text.toLowerCase()),
      sendSenderAction({ recipientId, action: 'typing_on' }),
    ]);

    await Promise.all([
      trackUser({ id: recipientId, ...user }),
      trackEvent(recipientId, 'Requested translations', {
        query: text,
        kk_translation: !!_.find({ toLang: 'kk' }, translations),
        ru_translation: !!_.find({ toLang: 'ru' }, translations),
      }),
    ]);

    return translations.length
      ? await Promise.all(_.map(
          (translation: Translation) => sendTextMessage({
            recipientId,
            text: _.truncate(
              { length: 320, omission: `...\n${translation.url}` },
              removeMarkdown(`${translation.title}:\n${translation.text}`),
            ),
          }),
          translations,
        ))
      : await sendTextMessage({ recipientId, text: noTranslationsFoundText });
  } catch (err) {
    logger.error(
      `Failed to reply to a message from user ${recipientId}:`,
      err.message,
    );

    return await sendTextMessage({ recipientId, text: errorText });
  }
};

export default handleMessage;