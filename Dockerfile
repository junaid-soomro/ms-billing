FROM node:10.18-alpine

RUN mkdir ms-billing
COPY . /ms-billing
WORKDIR /ms-billing

RUN npm install

RUN npm install nodemon -g

Expose 8022
CMD ["nodemon"]
