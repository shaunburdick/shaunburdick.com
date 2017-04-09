FROM node:alpine

MAINTAINER Shaun Burdick <docker@shaunburdick.com>

EXPOSE 5000

ENV HTTP_PORT=5000

ADD . /usr/src/myapp

WORKDIR /usr/src/myapp

RUN ["npm", "install"]

CMD ["npm", "start"]
