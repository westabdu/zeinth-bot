FROM node:20-bullseye-slim

# Python ve derleme araçlarını yükle (opus için gerekli)
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    make \
    g++ \
    build-essential \
    pkg-config \
    libtool \
    automake \
    autoconf \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Python linki oluştur (node-gyp için)
RUN ln -s /usr/bin/python3 /usr/bin/python

WORKDIR /app

# Önce sadece package.json'u kopyala
COPY package.json ./

# npm'yi güncelle (uyumlu versiyon) ve bağımlılıkları kur
RUN npm install -g npm@10.8.2
RUN npm install --build-from-source

# Geri kalan dosyaları kopyala
COPY . .

# Opus paketini yeniden derle
RUN npm rebuild @discordjs/opus --build-from-source

# Ortam değişkenlerini ayarla
ENV DISCORD_TOKEN=
ENV REPLICATE_API_KEY=
ENV FFMPEG_PATH=/usr/bin/ffmpeg
ENV NODE_ENV=production

# Çalıştırma komutu
CMD ["node", "src/app.js"]