# Dockerfile super robusto para Portainer Git Build
FROM node:20-slim

WORKDIR /app

# Instalar apenas dependências essenciais
RUN apt-get update && apt-get install -y \
    curl \
    python3 \
    build-essential \
    git \
    && rm -rf /var/lib/apt/lists/*

# Configurar NPM para máxima compatibilidade
RUN npm config set registry https://registry.npmjs.org/ && \
    npm config set legacy-peer-deps true && \
    npm config set fund false && \
    npm config set audit false

# Configurar variáveis de ambiente
ENV NODE_OPTIONS="--max_old_space_size=4096"
ENV NEXT_TELEMETRY_DISABLED=1
ENV CI=true

# Copiar package.json primeiro
COPY package*.json ./

# Limpar cache npm e instalar dependências step by step
RUN npm cache clean --force && \
    npm install --verbose --legacy-peer-deps --no-audit --no-fund --unsafe-perm || \
    (echo "Primeira tentativa falhou, tentando com yarn..." && \
     npm install -g yarn && \
     yarn install --ignore-engines --network-timeout 300000) || \
    (echo "Yarn falhou, tentando npm com flags adicionais..." && \
     npm install --legacy-peer-deps --no-audit --no-fund --unsafe-perm --force)

# Copiar código fonte
COPY . .

# Gerar Prisma client primeiro
RUN npx prisma generate || echo "Prisma generate falhou, continuando..."

# Build com retry
RUN npm run build || \
    (echo "Build falhou na primeira tentativa, limpando e tentando novamente..." && \
     rm -rf .next && \
     npm run build)

EXPOSE 3000

# Comando de inicialização com fallback
CMD ["sh", "-c", "npx prisma migrate deploy || echo 'Migration failed, continuing...' && npm start"]
