FROM node:20-bullseye-slim

RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    build-essential \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json ./

# Tüm script'leri devre dışı bırak
RUN npm config set ignore-scripts true

# Önce opus'u ayrı kur
RUN npm install @discordjs/opus --ignore-scripts --no-audit --no-fund

# Sonra diğerlerini kur
RUN npm install --ignore-scripts --no-audit --no-fund

# Sadece canvas'ı rebuild et
RUN npm rebuild canvas --ignore-scripts || true

COPY . .

ENV DISCORD_TOKEN=
ENV REPLICATE_API_KEY=
ENV PORT=3000

CMD ["node", "src/app.js"]