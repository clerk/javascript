FROM node:16-alpine

WORKDIR /ui

EXPOSE 4000

# This is a suboptimal way to build a Lerna monorepo Docker container as it doesn't leverage Docker layer caching.
# It is advisable not to be used for local development.
COPY . .

RUN npm install

ENTRYPOINT ["npm", "run", "dev"]
