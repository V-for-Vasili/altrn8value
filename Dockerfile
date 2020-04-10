FROM node:10

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

EXPOSE 8080

COPY . .

RUN echo "Installing memcached."
RUN echo $(apt-get update)
RUN echo $(apt-get -y install memcached)
RUN echo $(service memcached start)
RUN echo "Done."

CMD ["npm","start"]
