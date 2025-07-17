# Dockerfile para Dash (Next.js)

# Imagem base com tudo necessário para build
FROM node:20 AS builder

WORKDIR /app

# Instala dependências globais
RUN apt-get update && apt-get install -y \
    python3 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Primeiro, copie apenas os arquivos de dependências para melhor cache
COPY package*.json ./

# Use npm install em vez de npm ci (mais tolerante a erros)
RUN npm install

# Agora copie o resto do código
COPY . .

# Gere o cliente prisma e o build
RUN npx prisma generate
RUN npm run build

# Imagem final para produção
FROM node:20-alpine AS runner

WORKDIR /app

# Instala pacotes necessários para runtime
RUN apk add --no-cache curl

# Copie apenas arquivos necessários
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.env* ./
COPY --from=builder /app/next.config.ts ./

EXPOSE 3000

# Script de inicialização
CMD ["npm", "start"]
