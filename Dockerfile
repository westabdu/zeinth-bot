FROM node:18-slim

WORKDIR /app

# Önce package.json'u kopyala
COPY package.json ./

# Modülleri kur
RUN npm install

# Sonra tüm dosyaları kopyala
COPY . .

# Token'lar environment variable olarak geliyor
ENV DISCORD_TOKEN=
ENV REPLICATE_API_KEY=

# Botu başlat
CMD ["node", "src/app.js"]