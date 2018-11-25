FROM node:10.10
RUN apt-get update -qq && apt-get install -y build-essential libpq-dev libkrb5-dev
RUN mkdir /app
WORKDIR /app
CMD node server.js

ADD package.json /app/package.json
RUN npm install
ADD . /app
RUN node_modules/next/dist/bin/next build present
