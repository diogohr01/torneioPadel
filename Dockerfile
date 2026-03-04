# Build e runtime em Linux para evitar "invalid ELF header" do better-sqlite3 no Render
FROM node:22-bookworm-slim

# Ferramentas para compilar better-sqlite3 (módulo nativo)
RUN apt-get update -y && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY server ./server
COPY public ./public

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "server/app.js"]
