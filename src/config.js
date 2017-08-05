/* @flow */

import env from 'src/env';

const helpText = `
Просто введи слово, фразу или число, и я переведу.
Также я поддерживаю встроенный режим: просто набери \`@SozdikBot\` и любую фразу в поле сообщения и выбери подходящий тебе ответ.
`;
const startText = `
Привет! Я официальный бот sozdik.kz и могу переводить с русского на казахский и обратно.
${helpText}
Разработано: @yenbekbay\nСервис: sozdik.kz
`;
const noTranslationsFoundText = 'К сожалению, я не знаю, как это перевести 😔';
const errorText =
  'Что-то пошло не так. Пожалуйста, попробуйте еще раз чуть позже.';

const config = {
  fbPageAccessToken: env.required('FB_PAGE_ACCESS_TOKEN'),
  fbWebhookVerifyToken: env.required('FB_WEBHOOK_VERIFY_TOKEN'),
  mixpanelToken: env.required('MIXPANEL_TOKEN'),
  papertrailOptions: {
    host: env.optional('PAPERTRAIL_HOST'),
    port: env.optional('PAPERTRAIL_PORT'),
  },
  port: 8080,
  getSozdikApiKey: {
    telegram: env.required('SOZDIK_API_TELEGRAM_KEY'),
    facebook: env.required('SOZDIK_API_FACEBOOK_KEY'),
  },
  telegramBotToken: env.required('TELEGRAM_BOT_TOKEN'),
  tunnelOptions: {subdomain: 'sozdikbot'},
  isProduction: env.required('NODE_ENV') === 'production',
  telegramWebhookUrl: `/telegram${env.required('TELEGRAM_BOT_TOKEN')}`,
  messengerWebhookUrl: '/messenger',
  productionUrl: 'https://sozdikbot.anvilabs.co',
  helpText,
  startText,
  noTranslationsFoundText,
  errorText,
};

export default config;
