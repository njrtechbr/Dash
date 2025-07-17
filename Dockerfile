# Dockerfile para Dash (Next.js)

# Imagem base oficial do Node.js
FROM node:20-alpine AS builder

WORKDIR /app

# Instala dependências necessárias para o build
RUN apk add --no-cache python3 make g++ curl

# Copia os arquivos de dependências
COPY package.json package-lock.json ./

# Instala as dependências com mais detalhes de log
RUN npm ci --verbose || (echo "npm ci falhou, tentando com npm install..." && npm install --verbose)

# Copia o restante do código
COPY . .

# Prepara o prisma client
RUN npx prisma generate

# Gera o build de produção
RUN npm run build || (echo "Build falhou. Verificando logs:" && cat .next/error.log)

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
