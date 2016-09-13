/* @flow */

const {
  FB_PAGE_ACCESS_TOKEN,
  FB_WEBHOOK_VERIFY_TOKEN,
  MIXPANEL_TOKEN,
  PAPERTRAIL_HOST,
  PAPERTRAIL_PORT,
  SOZDIK_API_KEY,
  TELEGRAM_BOT_TOKEN,
} = process.env;

export default {
  papertrailOptions: (PAPERTRAIL_HOST && PAPERTRAIL_PORT) && {
    host: PAPERTRAIL_HOST,
    port: PAPERTRAIL_PORT,
  },
  fbPageAccessToken: FB_PAGE_ACCESS_TOKEN,
  fbWebhookVerifyToken: FB_WEBHOOK_VERIFY_TOKEN,
  mixpanelToken: MIXPANEL_TOKEN,
  sozdikApiKey: SOZDIK_API_KEY,
  telegramBotToken: TELEGRAM_BOT_TOKEN,
};
