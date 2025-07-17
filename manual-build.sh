#!/bin/bash

# Script para build manual do Dash (Next.js) em caso de falhas no Docker automatizado

echo "🔨 Iniciando build manual do Dash..."

# Instalar dependências
echo "📦 Instalando dependências..."
npm install --no-audit --no-fund --legacy-peer-deps

# Gerar prisma client
echo "🗄️ Gerando Prisma Client..."
npx prisma generate

# Construir Next.js
echo "🏗️ Construindo aplicação Next.js..."
NODE_OPTIONS="--max_old_space_size=4096" npm run build

# Iniciar aplicação
echo "✅ Build concluído! Execute 'npm start' para iniciar a aplicação."
