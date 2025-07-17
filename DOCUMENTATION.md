# Documentação do Projeto: FluxDash

## 1. Visão Geral

O FluxDash é um painel pessoal (dashboard) altamente customizável, projetado para centralizar acesso a sistemas web, acompanhar mídias como filmes e séries, e exibir informações úteis como cotações de moedas e clima. A aplicação utiliza inteligência artificial para auxiliar o usuário em tarefas como organização de links e sugestão de conteúdo.

## 2. Tecnologias Utilizadas (Tech Stack)

- **Framework**: [Next.js](https://nextjs.org/) (com App Router)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **UI Framework**: [React](https://reactjs.org/)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
- **Componentes UI**: [ShadCN UI](https://ui.shadcn.com/)
- **Inteligência Artificial**: [Google AI com Genkit](https://firebase.google.com/docs/genkit)
- **Banco de Dados**: [Prisma](https://www.prisma.io/) com [PostgreSQL](https://www.postgresql.org/)

## 3. Estrutura de Arquivos

A estrutura do projeto foi organizada para promover a separação de responsabilidades e facilitar a manutenção.

```
/
├── prisma/                 # Esquema do Prisma e migrações
│   └── schema.prisma
├── scripts/                # Scripts utilitários (migração, etc.)
│   └── migrate-firebase-to-postgres.ts
├── public/                 # Arquivos estáticos
├── src/
│   ├── app/                # Rotas e páginas principais (Next.js App Router)
│   ├── ai/                 # Lógica de Inteligência Artificial com Genkit
│   │   ├── flows/          # Fluxos de IA (ex: sugerir detalhes de um link)
│   │   └── genkit.ts       # Configuração principal do Genkit
│   ├── components/         # Componentes React reutilizáveis
│   │   ├── dashboard/      # Componentes específicos do painel
│   │   └── ui/             # Componentes base do ShadCN UI
│   ├── hooks/              # Hooks customizados (gerenciamento de estado e lógica)
│   ├── lib/                # Funções utilitárias, constantes e configuração do Prisma
│   │   └── prisma.ts       # Cliente Prisma configurado
│   └── services/           # Módulos de acesso a dados (Prisma, APIs externas)
└── ...
```

- **`src/app`**: Contém as páginas principais, o layout global (`layout.tsx`) e os estilos (`globals.css`).
- **`src/components`**: Dividido entre componentes de UI genéricos (`ui`) e componentes específicos da aplicação (`dashboard`).
- **`src/hooks`**: Onde a lógica de estado do lado do cliente é gerenciada (ex: `useLinks`, `useMovies`, `useWeather`).
- **`src/services`**: Camada de acesso a dados usando Prisma para comunicação com PostgreSQL e APIs externas.
- **`src/ai`**: Centraliza toda a funcionalidade de IA, usando o Genkit para definir prompts e fluxos.
- **`prisma`**: Contém o `schema.prisma` e as migrações do banco de dados PostgreSQL.

## 4. APIs Externas

A aplicação consome várias APIs para enriquecer a experiência do usuário.

- **TMDb (The Movie Database)**:
  - **Função**: Busca de informações detalhadas sobre filmes e séries, incluindo pôsteres, sinopses e onde assistir.
  - **Configuração**: Requer uma chave de API que deve ser definida na variável de ambiente `TMDB_API_KEY`.

- **AwesomeAPI (Cotações de Moedas)**:
  - **Função**: Fornece cotações de moedas em tempo real (Dólar, Euro).
  - **Configuração**: É uma API pública e não requer chave.

- **Open-Meteo (Previsão do Tempo)**:
  - **Função**: Fornece dados meteorológicos com base na geolocalização do usuário.
  - **Configuração**: É uma API pública e não requer chave.

- **Google Generative AI**:
  - **Função**: Potencializa as funcionalidades de IA, como sugestão de ícones, grupos e descrições para links.
  - **Configuração**:
    1.  Requer uma chave de API definida em `GOOGLE_API_KEY`.
    2.  A API **"Generative Language API"** deve estar ativada no projeto do Google Cloud.
    3.  A chave de API precisa ter permissão para acessar este serviço (sem restrições de API).

## 5. Banco de Dados

O projeto utiliza **PostgreSQL com Prisma** como solução de banco de dados principal.

### 5.1. Estrutura do Banco (PostgreSQL + Prisma)

O esquema do banco está definido em `prisma/schema.prisma`:

```prisma
model Link {
  id          String   @id @default(cuid())
  title       String
  url         String
  icon        String
  group       String
  description String?
  isFavorite  Boolean  @default(false)
  createdAt   DateTime @default(now())
}

model Movie {
  id          Int      @id // TMDb ID
  title       String
  poster_path String?
  watched     Boolean  @default(false)
  createdAt   DateTime @default(now())
}

model Show {
  id              Int      @id // TMDb ID
  name            String
  poster_path     String?
  watched_episodes WatchedEpisode[]
  createdAt       DateTime @default(now())
}

model WatchedEpisode {
  id          String   @id @default(cuid())
  episodeId   String   // S<season>E<episode>
  episodeName String
  watchedAt   DateTime @default(now())
  
  showId      Int
  show        Show     @relation(fields: [showId], references: [id], onDelete: Cascade)

  @@unique([showId, episodeId])
}
```

### 5.2. Configuração do Banco de Dados

1. **Configure a variável de ambiente `DATABASE_URL`** no arquivo `.env`:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/fluxdash?schema=public"
   ```

2. **Execute as migrações**:
   ```bash
   npm run db:migrate
   ```

3. **Gere o cliente Prisma**:
   ```bash
   npm run db:generate
   ```

### 5.3. Scripts Disponíveis para Banco de Dados

- `npm run db:generate` - Gera o cliente Prisma
- `npm run db:migrate` - Executa migrações em desenvolvimento
- `npm run db:reset` - Reseta o banco de dados
- `npm run db:studio` - Abre o Prisma Studio (interface visual)
- `npm run db:push` - Sincroniza o schema sem criar migração

### 5.4. Migração do Firebase (Opcional)

Se você possui dados no Firebase Firestore e deseja migrá-los para PostgreSQL, use o script de migração:

1. **Configure as variáveis do Firebase** no `.env` (se ainda não estiverem configuradas)
2. **Execute o script de migração**:
   ```bash
   npx tsx scripts/migrate-firebase-to-postgres.ts
   ```

⚠️ **Atenção**: O script de migração limpa os dados existentes antes de importar do Firebase.

## 6. Como Executar o Projeto

1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Configurar Variáveis de Ambiente**:
   - Copie o arquivo `environment.example` para `.env.local`
   - Configure pelo menos a `DATABASE_URL` para PostgreSQL
   - Configure `TMDB_API_KEY` e `GOOGLE_API_KEY` se necessário

3. **Configurar o Banco de Dados**:
   ```bash
   npm run db:migrate
   ```

4. **Rodar o ambiente de desenvolvimento**:
   ```bash
   npm run dev
   ```
   A aplicação estará disponível em `http://localhost:3000`.

## 7. Benefícios da Migração para PostgreSQL

- **Performance**: PostgreSQL oferece melhor performance para consultas complexas
- **Relacionamentos**: Suporte nativo a foreign keys e joins
- **Transações**: ACID compliant para operações críticas
- **Flexibilidade**: Facilita mudanças no schema e migrações
- **Eco sistema**: Maior compatibilidade com ferramentas de desenvolvimento
- **Custos**: Sem dependência de serviços proprietários como Firebase
