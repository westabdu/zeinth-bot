FROM node:20-bullseye-slim

# Gerekli sistem paketlerini yükle
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    build-essential \
    ffmpeg \
    git \
    && rm -rf /var/lib/apt/lists/*

# Python linki oluştur
RUN ln -s /usr/bin/python3 /usr/bin/python

WORKDIR /app

# Package.json'ı kopyala
COPY package.json ./

# Önce husky'yi global kur, sonra diğer paketleri kur
RUN npm install -g husky || true
RUN npm install --no-audit --no-fund --force || true
RUN npm install --no-audit --no-fund --force

# Geri kalan dosyaları kopyala
COPY . .

# Husky'yi devre dışı bırak
RUN npm pkg delete scripts.prepare || true
RUN npm pkg delete scripts.prepare-commit-msg || true
RUN npm pkg delete scripts.precommit || true

ENV DISCORD_TOKEN=
ENV REPLICATE_API_KEY=
ENV PORT=3000

CMD ["node", "src/app.js"]