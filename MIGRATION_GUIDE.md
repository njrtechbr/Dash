# 🚀 Guia de Migração: Firebase → PostgreSQL + Prisma

Este guia explica como migrar do Firebase Firestore para PostgreSQL usando Prisma.

## ✅ O que foi migrado

- ✅ **Services**: Todos os services (`links`, `movies`, `shows`) foram convertidos para usar API routes
- ✅ **API Routes**: Criadas todas as rotas de API para acessar Prisma no servidor
- ✅ **Schema**: Modelos do Prisma criados espelhando a estrutura do Firebase
- ✅ **Types**: TypeScript types atualizados para remover `docId` do Firebase
- ✅ **Scripts**: Scripts úteis do Prisma adicionados ao `package.json`
- ✅ **Migração de dados**: Script automático para migrar dados existentes
- ✅ **Arquitetura**: Separação cliente/servidor corrigida (Prisma só no servidor)

## 📋 Passos para finalizar a migração

### 1. Configure o PostgreSQL

Instale PostgreSQL localmente ou use um serviço como:
- [Railway](https://railway.app/)
- [Supabase](https://supabase.com/)
- [PlanetScale](https://planetscale.com/)
- [Neon](https://neon.tech/)

### 2. Configure as variáveis de ambiente

Copie `environment.example` para `.env.local` e configure:

```bash
# Obrigatório
DATABASE_URL="postgresql://username:password@localhost:5432/fluxdash?schema=public"

# Opcional (se quiser manter as APIs)
TMDB_API_KEY="sua_chave_tmdb"
GOOGLE_API_KEY="sua_chave_google_ai"
```

### 3. Execute as migrações do banco

```bash
# Instala dependências (incluindo Prisma CLI)
npm install

# Executa as migrações
npm run db:migrate

# Gera o cliente Prisma
npm run db:generate
```

### 4. (Opcional) Migre dados do Firebase

Se você tem dados no Firebase e quer migrá-los:

```bash
# Configure também as variáveis do Firebase no .env.local
# Execute o script de migração
npx tsx scripts/migrate-firebase-to-postgres.ts
```

### 5. Teste a aplicação

```bash
npm run dev
```

## 🔧 Scripts úteis disponíveis

```bash
npm run db:studio      # Interface visual do banco
npm run db:reset       # Reseta o banco (cuidado!)
npm run db:push        # Sincroniza schema sem migração
```

## 🆘 Possíveis problemas

### ❌ "Error: P1001: Can't reach database server"
- Verifique se o PostgreSQL está rodando
- Confirme a string de conexão `DATABASE_URL`

### ❌ "Error: Environment variable not found: DATABASE_URL"
- Certifique-se de que o arquivo `.env.local` existe
- Verifique se a variável `DATABASE_URL` está configurada

### ❌ Polling vs Real-time
- O Firebase tinha updates em tempo real
- Agora usamos polling a cada 5 segundos
- Para real-time, considere implementar websockets

## 📈 Próximos passos (opcional)

1. **Remover Firebase**: Se não precisar mais, remova `src/lib/firebase.ts`
2. **Real-time**: Implemente websockets para updates em tempo real
3. **Índices**: Adicione índices ao banco para melhor performance
4. **Backup**: Configure backups automáticos do PostgreSQL

## 🌐 API Routes Criadas

As seguintes rotas de API foram criadas para acessar o banco PostgreSQL:

**Links:**
- `GET /api/links` - Buscar todos os links
- `POST /api/links` - Criar link(s)
- `PUT /api/links/[id]` - Atualizar link
- `DELETE /api/links/[id]` - Deletar link
- `POST /api/links/reorder` - Reordenar links

**Movies:**
- `GET /api/movies` - Buscar todos os filmes
- `POST /api/movies` - Criar filme
- `PUT /api/movies/[id]` - Atualizar filme
- `DELETE /api/movies/[id]` - Deletar filme

**Shows:**
- `GET /api/shows` - Buscar todas as séries
- `POST /api/shows` - Criar série
- `DELETE /api/shows/[id]` - Deletar série
- `POST /api/shows/episodes` - Marcar/desmarcar episódio
- `POST /api/shows/seasons` - Marcar/desmarcar temporada

## 🎉 Benefícios conquistados

- ✅ **Performance melhorada** com PostgreSQL
- ✅ **Relações nativas** entre tabelas
- ✅ **Transações ACID** para operações críticas
- ✅ **Schema versionado** com migrações Prisma
- ✅ **Type safety** completo com Prisma Client
- ✅ **Custos reduzidos** sem dependência do Firebase
- ✅ **Arquitetura correta** com separação cliente/servidor 