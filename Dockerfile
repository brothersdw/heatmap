FROM node:18-alpine

# RUN apk update

WORKDIR /app

COPY package.json .

RUN apk update

RUN npm install

COPY . .

EXPOSE 3006

CMD ["npm", "start"]