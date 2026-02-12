FROM node:18-slim

WORKDIR /app

# Sadece package.json'u kopyala
COPY package.json ./

# npm install --production ile kur
RUN npm install --production --no-package-lock

# Geri kalan dosyaları kopyala
COPY . .

ENV DISCORD_TOKEN=
ENV REPLICATE_API_KEY=

CMD ["node", "src/app.js"]