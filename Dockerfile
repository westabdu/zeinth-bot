FROM node:20-bullseye-slim

# Gerekli sistem paketlerini yükle
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    build-essential \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Package.json'ı kopyala
COPY package.json ./

# Tüm paketleri kur (force ile)
RUN npm install --force

# Geri kalan dosyaları kopyala
COPY . .

ENV DISCORD_TOKEN=
ENV REPLICATE_API_KEY=
ENV PORT=3000

CMD ["node", "src/app.js"]