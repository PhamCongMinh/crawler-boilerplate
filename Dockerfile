FROM node:16 AS builder
WORKDIR /app
COPY ["package.json", "./"]
RUN yarn && yarn global add  @nestjs/cli pm2
COPY . .
