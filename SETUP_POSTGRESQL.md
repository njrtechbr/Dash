# 🗄️ Configuração do PostgreSQL para FluxDash

## 🚀 Opção 1: Railway (Recomendado - Gratuito)

1. **Acesse**: https://railway.app/
2. **Crie uma conta** (pode usar GitHub)
3. **Crie um novo projeto**
4. **Adicione PostgreSQL**:
   - Clique em "New" → "Database" → "PostgreSQL"
   - Aguarde a criação (2-3 minutos)
5. **Copie a URL de conexão**:
   - Na dashboard, clique no PostgreSQL
   - Vá em "Connect" → "Database URL"
   - Copie a URL completa

## 🌐 Opção 2: Supabase (Gratuito)

1. **Acesse**: https://supabase.com/
2. **Crie uma conta**
3. **Crie um novo projeto**
4. **Configure senha do banco**
5. **Vá em Settings → Database**
6. **Copie a "Connection string" (URI)**

## 🏠 Opção 3: PostgreSQL Local

1. **Instale PostgreSQL**: https://www.postgresql.org/download/
2. **Configure usuário e senha**
3. **Crie banco de dados**:
   ```sql
   CREATE DATABASE fluxdash;
   ```
4. **URL**: `postgresql://postgres:sua_senha@localhost:5432/fluxdash?schema=public`

## 📝 Configuração Final

1. **Edite o arquivo `.env.local`**:
   ```
   DATABASE_URL="SUA_URL_AQUI"
   ```

2. **Execute as migrações**:
   ```bash
   npm run db:migrate
   npm run db:generate
   ```

3. **Teste a aplicação**:
   ```bash
   npm run dev
   ```

## 🔧 Exemplo de .env.local completo

```env
# PostgreSQL
DATABASE_URL="postgresql://postgres:senha123@localhost:5432/fluxdash?schema=public"

# APIs (opcionais)
TMDB_API_KEY="sua_chave_tmdb"
GOOGLE_API_KEY="sua_chave_google"
```

## ⚠️ Importante

- **Nunca commite** o arquivo `.env.local`
- **Use URLs reais** nos exemplos acima
- **Teste a conexão** antes de prosseguir 