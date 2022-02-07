FROM node:16-alpine

WORKDIR /ui

EXPOSE 4000

COPY ["package.json", "package-lock.json*", "./"]
RUN npm install

ENTRYPOINT ["npm", "run", "dev"]
