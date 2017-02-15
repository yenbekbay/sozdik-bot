# sozdik-bot

[![Build Status](https://img.shields.io/travis/anvilabs/sozdik-bot.svg)](https://travis-ci.org/anvilabs/sozdik-bot)
[![Coverage Status](https://img.shields.io/codecov/c/github/anvilabs/sozdik-bot.svg)](https://codecov.io/gh/anvilabs/sozdik-bot)
[![Dependency Status](https://img.shields.io/david/anvilabs/sozdik-bot.svg)](https://david-dm.org/anvilabs/sozdik-bot)
[![devDependency Status](https://img.shields.io/david/dev/anvilabs/sozdik-bot.svg)](https://david-dm.org/anvilabs/sozdik-bot?type=dev)

[Telegram](https://telegram.me/SozdikBot) and [Messenger](https://m.me/sozdikbot) bot for Sozdik, a Russian to Kazakh dictionary

<img width="50%" src=".github/sozdik-telegram-bot.jpg" alt="Telegram screenshot"><img width="50%" src=".github/sozdik-messenger-bot.jpg" alt="Messenger screenshot">

## Development

1. **Install node/npm/yarn.** The app has been tested with node v6 and v7.

2. **Clone and install dependencies:**
```bash
$ git clone https://github.com/anvilabs/sozdik-bot.git
$ cd sozdik-bot
$ yarn # npm install
```

3. **Add environment variables:** `cp .env.example .env` and edit with your values.

4. **Run the server**
```bash
$ yarn start # npm start
```

## Deployment

1. Install Docker Toolbox: `$ brew tap caskroom/cask && brew cask install docker-toolbox`
2. [Create a docker machine using any available Docker Machine driver](https://docs.docker.com/machine/get-started-cloud/)
3. Deploy the app: `$ npm run deploy -- <machine_name>`

## License

[GNU GPLv3 License](./LICENSE) © Anvilabs LLC
