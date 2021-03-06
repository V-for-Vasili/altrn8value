FROM node:10

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

EXPOSE 80

COPY . .

RUN apt-get update && \
    apt-get install -y memcached

CMD ["npm","start"]
