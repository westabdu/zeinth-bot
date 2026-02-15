FROM node:20-bullseye-slim

# Canvas ve diğer paketler için gerekli tüm sistem kütüphanelerini yükle
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    build-essential \
    pkg-config \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    libpixman-1-dev \
    libfontconfig1-dev \
    libfreetype6-dev \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Python linki oluştur
RUN ln -s /usr/bin/python3 /usr/bin/python

WORKDIR /app

# Sadece package.json'u kopyala
COPY package.json ./

# npm'i güncelleme (versiyon uyarılarını görmezden gel)
RUN npm install -g npm@10.8.2 --force

# Bağımlılıkları kur (uyarıları görmezden gel)
RUN npm install --force --build-from-source

# Geri kalan dosyaları kopyala
COPY . .

# Ortam değişkenlerini ayarla
ENV DISCORD_TOKEN=
ENV REPLICATE_API_KEY=
ENV FFMPEG_PATH=/usr/bin/ffmpeg
ENV NODE_ENV=production
ENV npm_config_force=true

# Çalıştırma komutu
CMD ["node", "src/app.js"]