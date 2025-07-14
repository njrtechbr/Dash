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
- **Banco de Dados Atual**: [Firebase Firestore](https://firebase.google.com/docs/firestore) (para persistência de dados em tempo real)
- **Preparação para Futuro BD**: [Prisma](https://www.prisma.io/) com [PostgreSQL](https://www.postgresql.org/)

## 3. Estrutura de Arquivos

A estrutura do projeto foi organizada para promover a separação de responsabilidades e facilitar a manutenção.

```
/
├── prisma/                 # Esquema do Prisma para a futura migração
│   └── schema.prisma
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
│   ├── lib/                # Funções utilitárias, constantes e configuração do Firebase
│   └── services/           # Módulos de acesso a dados (Firestore, APIs externas)
└── ...
```

- **`src/app`**: Contém as páginas principais, o layout global (`layout.tsx`) e os estilos (`globals.css`).
- **`src/components`**: Dividido entre componentes de UI genéricos (`ui`) e componentes específicos da aplicação (`dashboard`).
- **`src/hooks`**: Onde a lógica de estado do lado do cliente é gerenciada (ex: `useLinks`, `useMovies`, `useWeather`).
- **`src/services`**: Isola toda a comunicação externa, seja com o Firestore ou com APIs de terceiros. Esta camada é fundamental para a futura migração de banco de dados.
- **`src/ai`**: Centraliza toda a funcionalidade de IA, usando o Genkit para definir prompts e fluxos.
- **`prisma`**: Contém o `schema.prisma` que define a estrutura do banco de dados PostgreSQL para quando a migração for realizada.

## 4. APIs Externas

A aplicação consome várias APIs para enriquecer a experiência do usuário.

- **TMDb (The Movie Database)**:
  - **Função**: Busca de informações detalhadas sobre filmes e séries, incluindo pôsteres, sinopses e onde assistir.
  - **Configuração**: Requer uma chave de API que deve ser definida na variável de ambiente `TMDB_API_KEY` no arquivo `next.config.ts`.

- **AwesomeAPI (Cotações de Moedas)**:
  - **Função**: Fornece cotações de moedas em tempo real (Dólar, Euro).
  - **Configuração**: É uma API pública e não requer chave.

- **Open-Meteo (Previsão do Tempo)**:
  - **Função**: Fornece dados meteorológicos com base na geolocalização do usuário.
  - **Configuração**: É uma API pública e não requer chave.

- **Google Generative AI**:
  - **Função**: Potencializa as funcionalidades de IA, como sugestão de ícones, grupos e descrições para links.
  - **Configuração**:
    1.  Requer uma chave de API definida em `GOOGLE_API_KEY` no `next.config.ts`.
    2.  A API **"Generative Language API"** deve estar ativada no projeto do Google Cloud.
    3.  A chave de API precisa ter permissão para acessar este serviço (sem restrições de API).

## 5. Banco de Dados

Atualmente, o projeto utiliza o **Firebase Firestore** como banco de dados principal. No entanto, ele foi estruturado para permitir uma migração tranquila para **Prisma com PostgreSQL**.

### 5.1. Estrutura Atual (Firestore)

- **Coleções**: `links`, `movies`, `shows`.
- **Funcionamento**: A comunicação é feita através dos módulos em `src/services/`, que utilizam o SDK do Firebase para operações de leitura e escrita em tempo real.

### 5.2. Preparação para Prisma + PostgreSQL

O arquivo `prisma/schema.prisma` já contém os modelos de dados que espelham as coleções do Firestore.

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
  id          Int      @id
  docId       String?  @unique
  title       String
  poster_path String?
  watched     Boolean  @default(false)
}

model Show {
  id              Int               @id
  docId           String?           @unique
  name            String
  poster_path     String?
  watched_episodes WatchedEpisode[]
}

model WatchedEpisode {
  id          String   @id @default(cuid())
  episodeId   String
  episodeName String
  watchedAt   DateTime @default(now())
  showId      Int
  Show        Show     @relation(fields: [showId], references: [id])
}
```

**Para completar a migração no futuro:**
1.  Configure a variável de ambiente `DATABASE_URL` com a string de conexão do seu banco PostgreSQL.
2.  Execute `npx prisma migrate dev` para criar as tabelas no banco de dados.
3.  Reescreva as funções nos arquivos `src/services/*-service.ts` para usar o Prisma Client em vez do SDK do Firebase.

## 6. Como Executar o Projeto

1.  **Instalar dependências**:
    ```bash
    npm install
    ```

2.  **Configurar Variáveis de Ambiente**:
    - Verifique o arquivo `next.config.ts` e certifique-se de que as variáveis de ambiente `TMDB_API_KEY` e as chaves do Firebase/Google AI estão configuradas corretamente.

3.  **Rodar o ambiente de desenvolvimento**:
    ```bash
    npm run dev
    ```
    A aplicação estará disponível em `http://localhost:9002`.
