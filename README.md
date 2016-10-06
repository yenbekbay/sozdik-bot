# sozdik-bot [![Build Status][travis-image]][travis-url] [![Coverage Status][codecov-image]][codecov-url] [![Dependency Status][dependency-image]][dependency-url] [![devDependency Status][devDependency-image]][devDependency-url] [![Commitizen Friendly][commitizen-image]][commitizen-url]
> Telegram and Messenger bot for Sozdik, a Russian to Kazakh dictionary

## Development

1. Copy env-example to .env and set the variables
2. Install npm modules: `$ npm run install`
3. Start the app: `$ npm run start`

## Deployment

1. Install Docker Toolbox: `$ brew tap caskroom/cask && brew cask install docker-toolbox`
2. [Create a docker machine using any available Docker Machine driver](https://docs.docker.com/machine/get-started-cloud/)
3. Deploy the app: `$ npm run deploy -- <machine_name>`

## License

[MIT License](./LICENSE) © Anvilabs LLC 

[travis-url]: https://travis-ci.org/anvilabs/sozdik-bot
[travis-image]: https://img.shields.io/travis/anvilabs/sozdik-bot.svg

[codecov-url]: https://codecov.io/gh/anvilabs/sozdik-bot
[codecov-image]: https://img.shields.io/codecov/c/github/anvilabs/sozdik-bot.svg

[dependency-url]: https://david-dm.org/anvilabs/sozdik-bot
[dependency-image]: https://img.shields.io/david/anvilabs/sozdik-bot.svg

[devDependency-url]: https://david-dm.org/anvilabs/sozdik-bot?type=dev
[devDependency-image]: https://img.shields.io/david/dev/anvilabs/sozdik-bot.svg

[commitizen-url]: http://commitizen.github.io/cz-cli
[commitizen-image]: https://img.shields.io/badge/commitizen-friendly-brightgreen.svg
