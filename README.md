# sozdik-bot
> Telegram and Messenger bot for Sozdik, a Russian to Kazakh dictionary

## Installation

1. Install Docker Toolbox: `$ brew tap caskroom/cask && brew cask install docker-toolbox`
2. Run some Docker commands to make sure that Docker Engine is up-and-running:
```bash
$ docker run hello-world

Hello from Docker.
This message shows that your installation appears to be working correctly.
...
```
3. [Create a docker machine using any available Docker Machine driver](https://docs.docker.com/machine/get-started-cloud/)
4. Connect to the machine: `$ eval "$(docker-machine env <machine_name>)"`
5. Copy env-example to .env and set the variables
6. Install npm modules and build the app: `$ npm install && npm run build`
7. Run the app: `$ docker-compose up -d`

## Development

Rebuild the app:
```bash
$ npm run build
$ docker-compose build
$ docker-compose up -d
```

Access logs:
```bash
$ docker-compose logs
```
