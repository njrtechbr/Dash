REM Script para build manual do Dash (Next.js) em caso de falhas no Docker automatizado

@echo off
echo 🔨 Iniciando build manual do Dash...

REM Instalar dependências
echo 📦 Instalando dependências...
call npm install --no-audit --no-fund --legacy-peer-deps

REM Gerar prisma client
echo 🗄️ Gerando Prisma Client...
call npx prisma generate

REM Construir Next.js
echo 🏗️ Construindo aplicação Next.js...
set NODE_OPTIONS=--max_old_space_size=4096
call npm run build

REM Iniciar aplicação
echo ✅ Build concluído! Execute 'npm start' para iniciar a aplicação.
