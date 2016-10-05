FROM keymetrics/pm2-docker-alpine:latest

# Set environment variables
ENV NPM_CONFIG_LOGLEVEL warn
ENV appDir /opt/app

# Set the work directory
RUN mkdir -p ${appDir}
WORKDIR ${appDir}

# Add our package.json and install *before* adding our application files
ADD package.json ./
RUN npm i --production

# Add application files
ADD . ./

# Expose the port
EXPOSE 8080

CMD ["pm2-docker", "start", "pm2.json"]
