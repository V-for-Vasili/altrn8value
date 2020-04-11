FROM node:10

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

EXPOSE 8080

COPY . .

EXPOSE 11211/tcp 11211/udp

RUN apt-get update && \
    apt-get install -y memcached && \
    service memcached start && \
    service memcached

CMD ["npm","start"]
