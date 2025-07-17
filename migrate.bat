@echo off
echo.
echo ========================================
echo   MIGRACAO DO PRISMA PARA POSTGRESQL
echo ========================================
echo.

echo ✅ Verificando se DATABASE_URL está configurada...
if not exist .env.local (
    echo ❌ Arquivo .env.local não encontrado!
    echo.
    echo Crie o arquivo .env.local com:
    echo DATABASE_URL="postgresql://usuario:senha@host:5432/banco?schema=public"
    echo.
    pause
    exit /b 1
)

echo ✅ Gerando cliente Prisma...
call npm run db:generate
if errorlevel 1 (
    echo ❌ Erro ao gerar cliente Prisma
    pause
    exit /b 1
)

echo.
echo ✅ Executando migrações...
call npm run db:migrate
if errorlevel 1 (
    echo ❌ Erro ao executar migrações
    pause
    exit /b 1
)

echo.
echo ✅ Testando conexão...
call npm run build
if errorlevel 1 (
    echo ❌ Erro no build
    pause
    exit /b 1
)

echo.
echo ========================================
echo   MIGRACAO CONCLUIDA COM SUCESSO! 🎉
echo ========================================
echo.
echo Agora você pode executar:
echo   npm run dev
echo.
pause 