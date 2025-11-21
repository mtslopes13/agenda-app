# 📅 Agenda Pessoal - Full Stack

Uma aplicação completa de agenda pessoal com lista de tarefas e controle financeiro, desenvolvida com TypeScript, Express.js, Prisma ORM e React.

## 🚀 Funcionalidades

### ✅ Lista de Tarefas
- Criar novas tarefas
- Marcar tarefas como completas
- Visualizar tarefas por data
- Excluir tarefas

### 💰 Controle Financeiro
- Registrar receitas e despesas
- Visualizar extrato mensal
- Ver saldo e totais
- Categorizar transações

## 🛠️ Tecnologias

### Backend
- **Node.js** + **TypeScript**
- **Express.js** - Framework web
- **Prisma ORM** - Banco de dados
- **PostgreSQL** - Banco de dados principal
- **SQLite** - Opção para desenvolvimento

### Frontend
- **React** + **TypeScript**
- **Axios** - Cliente HTTP
- **CSS** - Estilização

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn
- PostgreSQL (opcional - SQLite incluso)

## 🚀 Como Executar

### 1. Clone o repositório
```bash
git clone https://github.com/LKSFDS/agenda-app.git
cd agenda-app
```

### 2. Configure o Backend
```bash
cd backend

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp ../.env.example prisma/.env
# Edite o arquivo prisma/.env com suas configurações

# Configure o banco de dados
npx prisma generate
npx prisma migrate dev --name init

# Execute o servidor
npm run dev
```

### 3. Configure o Frontend
```bash
cd ../frontend

# Instale as dependências
npm install

# Execute o frontend
npm start
```

### 4. Acesse a aplicação
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Prisma Studio**: http://localhost:5555 (execute `npx prisma studio` no backend)

## 🐘 Configuração do Banco de Dados

### Opção 1: PostgreSQL (Recomendado)
```bash
# Com Docker
docker run --name postgres-agenda \
  -e POSTGRES_USER=agenda_user \
  -e POSTGRES_PASSWORD=senha123 \
  -e POSTGRES_DB=agenda_db \
  -p 5432:5432 \
  -d postgres:15
```

### Opção 2: SQLite (Desenvolvimento)
Altere o `prisma/schema.prisma` para:
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

## 📁 Estrutura do Projeto

```
agenda-app/
├── backend/                 # API Backend
│   ├── src/
│   │   ├── controllers/     # Lógica das rotas
│   │   ├── routes/          # Definição de rotas
│   │   └── app.ts          # Configuração do Express
│   ├── prisma/
│   │   └── schema.prisma   # Schema do banco
│   └── package.json
├── frontend/               # Aplicação React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── services/       # API services
│   │   └── types/          # Tipos TypeScript
│   └── package.json
├── .gitignore
├── .env.example
└── README.md
```

## 🛠️ Comandos Úteis

### Backend
```bash
npm run dev          # Desenvolvimento
npm run build        # Build para produção
npm start           # Produção
npx prisma studio   # Interface do banco
```

### Frontend
```bash
npm start           # Desenvolvimento
npm run build       # Build para produção
```

## 🔧 Variáveis de Ambiente

Crie um arquivo `prisma/.env` no backend com:

```env
DATABASE_URL="sua_string_de_conexao"
PORT=3001
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Autores

Lucas Freire de Siqueira - [link github](https://github.com/LKSFDS)

Mateus Rodrigues Lopes - [link github](https://github.com/mtslopes13)
