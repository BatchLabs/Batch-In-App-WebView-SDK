FROM node:15-buster

LABEL MAINTAINER="@arnaud <arnaud@batch.com>"
LABEL DESCRIPTION="Batch In-App Webview SDK Build Image"

WORKDIR /src

COPY package.json /src/package.json
COPY package-lock.json /src/package-lock.json

RUN npm install

COPY . /src
