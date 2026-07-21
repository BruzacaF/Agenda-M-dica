# Agenda Médica - Sistema de Agendamentos

Este repositório contém o projeto **Agenda Médica**, uma aplicação estruturada para consulta e gestão de agendamentos médicos integrando um frontend em Angular com dois microsserviços backend em Python/Flask (API Principal e Mock API).

---

## 🏗️ Arquitetura do Sistema

A aplicação foi desenhada utilizando uma arquitetura orientada a serviços e conteinerizada via Docker, promovendo um isolamento completo e facilidade de deploy.

```text
Agenda Médica (Root)
├── backend/                   # Backend Principal (API de Autenticação / Flask)
├── mock-api/                  # Serviço de Agendamentos Médicos (Mock API / Flask)
├── frontend/                  # Frontend SPA (Angular v17)
└── docker-compose.yml         # Orquestrador local dos contêineres
```

1. **Frontend (Angular)**: Interface de usuário SPA moderna e responsiva. Consome a API Principal para fluxos de autenticação e a Mock API para carregar a grade de agendamentos médicos.
2. **Backend Principal (Flask)**: Responsável pela lógica de autenticação (geração e validação de tokens JWT) e conexões seguras com o banco de dados (SQLite).
3. **Mock API (Flask)**: Serviço independente que atua como API de terceiros, provendo a listagem e os payloads brutos de agendamentos médicos.

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Angular 17**: Framework principal para construção da interface.
- **Tabulator (Vanilla JS)**: Biblioteca de tabelas embutida e customizada no Angular para filtros, buscas e ordenação.
- **RxJS**: Gerenciamento de fluxos assíncronos e resiliência nas chamadas HTTP.

### Backend & Mock API
- **Python 3.11**: Linguagem de programação do ecossistema backend.
- **Flask 3.0.3**: Microframework para exposição das APIs RESTful.
- **PyJWT**: Manipulação e criptografia de tokens JWT.
- **Flask-CORS**: Gerenciamento de políticas de compartilhamento de recursos de origem cruzada.
- **SQLite**: Banco de dados relacional leve e local.

---

## 🚀 Como Iniciar o Projeto (Docker Compose)

Certifique-se de possuir o **Docker** e o **Docker Compose** instalados na sua máquina.

### Execução

Na raiz do repositório, execute o comando abaixo para realizar o build e iniciar todos os serviços simultaneamente:

```bash
docker-compose up --build
```

Os serviços estarão disponíveis nos seguintes endereços:
- **Frontend SPA**: [http://localhost:4200](http://localhost:4200)
- **Backend API**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Mock API**: [http://localhost:5001/api/agendamentos/health](http://localhost:5001/api/agendamentos/health)

---

## 📝 Detalhamento da Etapa 1 - Inicialização de Infraestrutura

Esta etapa estabeleceu as fundações do projeto com os seguintes esqueletos e arquivos de configuração:

### 1. Microsserviço Backend (API Principal)
- [app.py](file:///c:/Users/Bruza/OneDrive/Área de Trabalho/Agenda Médica/backend/app.py) - Endpoint `/api/health` para monitoramento.
- [requirements.txt](file:///c:/Users/Bruza/OneDrive/Área de Trabalho/Agenda Médica/backend/requirements.txt) - Manifesto de dependências.
- [Dockerfile](file:///c:/Users/Bruza/OneDrive/Área de Trabalho/Agenda Médica/backend/Dockerfile) - Imagem do Python 11 e script de start.

### 2. Microsserviço Mock API
- [app.py](file:///c:/Users/Bruza/OneDrive/Área de Trabalho/Agenda Médica/mock-api/app.py) - Endpoint `/api/agendamentos/health` para testes de integridade.
- [requirements.txt](file:///c:/Users/Bruza/OneDrive/Área de Trabalho/Agenda Médica/mock-api/requirements.txt) - Dependências leves.
- [Dockerfile](file:///c:/Users/Bruza/OneDrive/Área de Trabalho/Agenda Médica/mock-api/Dockerfile) - Dockerfile expondo a porta 5001.

### 3. Frontend Angular
- [package.json](file:///c:/Users/Bruza/OneDrive/Área de Trabalho/Agenda Médica/frontend/package.json) - Definição do Angular v17 e Tabulator.
- [angular.json](file:///c:/Users/Bruza/OneDrive/Área de Trabalho/Agenda Médica/frontend/angular.json) - Configurações do compilador.
- [tsconfig.json](file:///c:/Users/Bruza/OneDrive/Área de Trabalho/Agenda Médica/frontend/tsconfig.json) - Configurações gerais TypeScript.
- [app.routes.ts](file:///c:/Users/Bruza/OneDrive/Área de Trabalho/Agenda Médica/frontend/src/app/app.routes.ts) - Definição das rotas base.
- [Dockerfile](file:///c:/Users/Bruza/OneDrive/Área de Trabalho/Agenda Médica/frontend/Dockerfile) - Node dev server rodando na porta 4200.

### 4. Orquestrador
- [docker-compose.yml](file:///c:/Users/Bruza/OneDrive/Área de Trabalho/Agenda Médica/docker-compose.yml) - Definição da rede bridge `agenda-medica-network` e acoplamento dos serviços.
- [.env](file:///c:/Users/Bruza/OneDrive/Área de Trabalho/Agenda Médica/.env) - Configurações de portas locais de acesso.
- [.gitignore](file:///c:/Users/Bruza/OneDrive/Área de Trabalho/Agenda Médica/.gitignore) - Exclusão de artefatos desnecessários ao repositório.
