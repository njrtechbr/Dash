# 🔧 Comandos para Executar Migrações do Prisma

## 📋 Passo a Passo

### 1️⃣ **Configure a DATABASE_URL** 
Edite o arquivo `.env.local` com sua URL real do PostgreSQL:

```env
DATABASE_URL="postgresql://usuario:senha@host:5432/banco?schema=public"
```

### 2️⃣ **Execute os comandos em ordem:**

```bash
# 1. Gerar cliente Prisma
npm run db:generate

# 2. Executar migrações (cria as tabelas)
npm run db:migrate

# 3. Testar se funcionou
npm run dev
```

## 🚀 **Alternativa: Execute o script automático**

```bash
# No Windows
migrate.bat

# Ou manualmente:
./migrate.bat
```

## 🗂️ **Tabelas que serão criadas:**

- ✅ `Link` - Para links do dashboard
- ✅ `Movie` - Para filmes
- ✅ `Show` - Para séries
- ✅ `WatchedEpisode` - Para episódios assistidos

## 🔍 **Verificar se funcionou:**

Após executar as migrações, você deve ver:
- ✅ Build bem-sucedido
- ✅ Servidor rodando sem erros de tabela
- ✅ Dashboard carregando normalmente

## 🆘 **Se der erro:**

1. **Verifique a DATABASE_URL**
2. **Certifique-se que o PostgreSQL está rodando**
3. **Tente executar cada comando individualmente**

## 📊 **Comandos extras úteis:**

```bash
# Ver status das migrações
npx prisma migrate status

# Interface visual do banco
npm run db:studio

# Resetar banco (cuidado!)
npm run db:reset
``` 