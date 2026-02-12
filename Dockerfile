FROM node:18-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV DISCORD_TOKEN=
ENV REPLICATE_API_KEY=

CMD ["node", "src/app.js"]