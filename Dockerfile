# Dockerfile otimizado para Portainer Git Build
FROM node:20-slim

WORKDIR /app

# Instalar dependências de sistema necessárias para build
RUN apt-get update && apt-get install -y \
    curl \
    python3 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Configurar variáveis para evitar problemas de build
ENV NODE_OPTIONS="--max_old_space_size=4096"
ENV NEXT_TELEMETRY_DISABLED=1

# Copiar arquivos de configuração primeiro (para melhor cache)
COPY package*.json ./
COPY tsconfig.json ./
COPY next.config.ts ./
COPY tailwind.config.ts ./
COPY postcss.config.mjs ./

# Instalar dependências com configurações específicas para Portainer
RUN npm install --legacy-peer-deps --no-audit --no-fund

# Copiar código fonte
COPY . .

# Gerar Prisma client
RUN npx prisma generate

# Build da aplicação
RUN npm run build

# Limpar dependências desnecessárias
RUN npm prune --production

EXPOSE 3000

# Script de inicialização que executa migrações e inicia app
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
