FROM node:14
WORKDIR /app/
COPY package.json index.js scrapper.js ./
RUN npm install
EXPOSE 5000
CMD node index.js
