#!/usr/bin/env bash

npm run build
docker build -t sozdikbot .
docker run -it --rm sozdikbot