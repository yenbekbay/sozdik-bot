FROM node:latest

# Set environment variables
ENV NPM_CONFIG_LOGLEVEL warn
ENV appDir /opt/app

# Set the work directory
RUN mkdir -p ${appDir}
WORKDIR ${appDir}

# Add our package.json and install *before* adding our application files
ADD package.json ./
RUN npm i --production

# Install pm2 *globally* so we can run our application
RUN npm i -g pm2

# Add application files
ADD . ./

# Expose the port
EXPOSE 8080

CMD ["pm2", "start", "pm2.json", "--no-daemon"]
