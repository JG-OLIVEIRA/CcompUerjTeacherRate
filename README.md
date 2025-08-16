# CcompUerjTeacherRate 🚀

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
</p>

<p align="center">
  O lugar central para encontrar, avaliar e discutir sobre os professores do curso de Ciência da Computação da UERJ. 🎓
</p>

---

## ✨ Principais Funcionalidades

-   **Avaliação de Professores**: Avalie os professores com base em sua didática, metodologia e experiência geral.
-   **Visualização por Matéria**: Navegue pelas matérias do curso para ver todos os professores avaliados em cada uma.
-   **Ranking e Estatísticas**: Veja a nota média de cada professor e estatísticas gerais da plataforma.
-   **Fluxograma Interativo**: Acompanhe seu progresso no curso e receba recomendações de matérias com base nos professores mais bem avaliados.
-   **Moderação Comunitária**: Ajude a manter a plataforma segura e construtiva, votando em avaliações denunciadas.
-   **Canal para Professores**: Um formulário dedicado para que professores possam solicitar a remoção ou correção de seus dados.

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído com uma stack moderna e robusta, focada em performance e experiência de desenvolvimento.

-   **Framework**: [Next.js](https://nextjs.org/) (App Router)
-   **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
-   **UI**: [React](https://react.dev/)
-   **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
-   **Componentes UI**: [Shadcn/ui](https://ui.shadcn.com/)
-   **Banco de Dados**: [PostgreSQL](https://www.postgresql.org/)
-   **Deploy**: [Firebase App Hosting](https://firebase.google.com/docs/hosting)

## 🚀 Como Começar

Siga os passos abaixo para configurar e executar o projeto em seu ambiente local.

### 1. Pré-requisitos

-   [Node.js](https://nodejs.org/en) (versão 18 ou superior)
-   [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
-   Acesso a um banco de dados PostgreSQL.

### 2. Instalação

Clone o repositório e instale as dependências:

```bash
git clone https://github.com/SEU_USUARIO/ccompuerjteacherrate.git
cd ccompuerjteacherrate
npm install
```

### 3. Configuração do Ambiente

Crie um arquivo de ambiente copiando o exemplo:

```bash
cp .env.example .env
```

Abra o arquivo `.env` e configure a variável `DATABASE_URL` com a sua string de conexão do PostgreSQL.

```
# .env
DATABASE_URL="postgresql://USUARIO:SENHA@HOST:PORTA/NOME_DO_BANCO?ssl=true"
```

**Importante**: Para bancos de dados em produção que exigem conexão segura, adicione `?ssl=true` ao final da URL.

### 4. Configuração do Banco de Dados

Para que a aplicação funcione, as tabelas `teachers`, `subjects`, `reviews` e `professor_requests` precisam ser criadas no seu banco de dados. Execute o script SQL encontrado em `schema.sql` para criar a estrutura necessária.

### 5. Executando a Aplicação

Com tudo configurado, inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver a aplicação em funcionamento.

---

Feito com ❤️ para ajudar os alunos da CComp UERJ.
