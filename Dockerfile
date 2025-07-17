# Dockerfile para Dash (Next.js)

# Imagem base oficial do Node.js
FROM node:20-alpine AS builder

WORKDIR /app

# Copia os arquivos de dependências
COPY package.json package-lock.json ./

# Instala as dependências
RUN npm ci

# Copia o restante do código
COPY . .

# Gera o build de produção
RUN npm run build

# Imagem final para produção
FROM node:20-alpine AS runner
WORKDIR /app

# Copia apenas os arquivos necessários do build
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src
COPY --from=builder /app/.env* ./

EXPOSE 3000

CMD ["npm", "start"]
