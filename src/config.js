/* @flow */

import env from 'src/utils/env';

const telegramHelpText = `
Просто введи слово, фразу или число, и я переведу.
Также я поддерживаю встроенный режим: просто набери \`@SozdikBot\` и любую фразу в поле сообщения и выбери подходящий тебе ответ.
`;
const telegramStartText = `
Привет! Я официальный бот sozdik.kz и могу переводить с русского на казахский и обратно.
${telegramHelpText}
Разработано: @yenbekbay\nСервис: sozdik.kz
`;

const messengerGreetingText =
  'Просто введи слово, фразу или число, и я переведу.';

const noTranslationsFoundText = 'К сожалению, я не знаю, как это перевести 😔';
const errorText =
  'Что-то пошло не так. Пожалуйста, попробуйте еще раз чуть позже.';

const config = {
  isProduction: env.required('NODE_ENV') === 'production',

  port: 8080,
  tunnelOptions: {subdomain: 'sozdikbot'},
  telegramWebhookUrl: `/telegram${env.required('TELEGRAM_BOT_TOKEN')}`,
  messengerWebhookUrl: '/messenger',
  productionUrl: 'https://sozdikbot.anvilabs.co',

  telegramBotToken: env.required('TELEGRAM_BOT_TOKEN'),
  fbPageAccessToken: env.required('FB_PAGE_ACCESS_TOKEN'),
  fbWebhookVerifyToken: env.required('FB_WEBHOOK_VERIFY_TOKEN'),
  mixpanelToken: env.required('MIXPANEL_TOKEN'),
  sozdikApiKey: {
    telegram: env.required('SOZDIK_API_TELEGRAM_KEY'),
    facebook: env.required('SOZDIK_API_FACEBOOK_KEY'),
  },
  papertrailHost: env.optional('PAPERTRAIL_HOST'),
  papertrailPort: env.optional('PAPERTRAIL_PORT'),

  telegramHelpText,
  telegramStartText,
  messengerGreetingText,
  noTranslationsFoundText,
  errorText,
};

export default config;
