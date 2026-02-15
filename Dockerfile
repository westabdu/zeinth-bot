FROM node:20-slim

# Sadece ffmpeg yükle
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json ./

# Script'leri devre dışı bırak ve paketleri kur
RUN npm config set ignore-scripts true
RUN npm install --no-audit --no-fund

COPY . .

ENV DISCORD_TOKEN=
ENV REPLICATE_API_KEY=
ENV PORT=3000

CMD ["node", "src/app.js"]