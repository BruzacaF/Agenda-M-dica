# Agenda Médica - Sistema de Agendamentos

Este repositório contém o projeto **Agenda Médica**, uma aplicação estruturada para consulta e gestão de agendamentos médicos integrando um frontend em Angular com dois microsserviços backend em Python/Flask (API Principal de Autenticação e Mock API de Agendamentos).

---

## 🏗️ Arquitetura do Sistema

A aplicação foi desenhada utilizando uma arquitetura orientada a serviços e conteinerizada via Docker, promovendo um isolamento completo e facilidade de deploy.

```text
Agenda Médica (Root)
├── backend/                   # Backend Principal (API de Autenticação / Flask + SQLite)
├── mock-api/                  # Serviço de Agendamentos Médicos (Mock API / Flask)
├── frontend/                  # Frontend SPA (Angular v17 + Tabulator Tables)
└── docker-compose.yml         # Orquestrador local dos contêineres
```

1. **Frontend (Angular 17)**: Interface SPA moderna com visual responsivo, formulário de login reativo, proteção de rotas (`AuthGuard`), cabeçalho automático via `HttpInterceptor` e tabela interativa de agendamentos com a biblioteca Vanilla JS **Tabulator**.
2. **Backend Principal (Flask)**: Responsável pela autenticação segura de usuários (`POST /api/login`), geração/validação de tokens JWT, armazenamento seguro de senhas com hash e banco relacional SQLite.
3. **Mock API (Flask)**: Serviço independente de agendamentos médicos (`GET /api/agendamentos`) lendo dados formatados em JSON com suporte a testes de resiliência (`?fail=true` e `?empty=true`).

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Angular 17**: Framework SPA com componentes standalone.
- **Tabulator Tables (v5.5)**: Tabela interativa para ordenação, buscas e formatação customizada.
- **RxJS**: Operadores assíncronos, tratamento de timeouts e resiliência (`catchError`, `map`).
- **CSS3 / Flexbox / Glassmorphism**: Interface moderna, limpa e responsiva sem uso de bibliotecas de UI pesadas.

### Backend & Mock API
- **Python 3.11**: Linguagem base.
- **Flask 3.0.3**: Microframework REST.
- **PyJWT**: Criptografia de tokens JWT.
- **Werkzeug Security**: Hash seguro de senhas.
- **Pytest**: Testes automatizados e unitários.
- **SQLite**: Banco de dados relacional leve.

---

## 🚀 Como Iniciar o Projeto (Docker Compose)

Certifique-se de possuir o **Docker** e o **Docker Compose** instalados na sua máquina.

### Execução

Na raiz do repositório, execute o comando para build e inicialização dos 3 contêineres:

```bash
docker-compose up --build
```

Os serviços estarão acessíveis nos seguintes endereços:
- **Frontend SPA**: [http://localhost:4200](http://localhost:4200)
- **Backend API**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Mock API**: [http://localhost:5001/api/agendamentos/health](http://localhost:5001/api/agendamentos/health)

---

## 🔑 Credenciais de Teste

Para autenticação na tela de login ([http://localhost:4200/login](http://localhost:4200/login)) ou via `POST /api/login`:

- **E-mail**: `admin@agendamedica.com.br`
- **Senha**: `AdminPassword123`

---

## 📚 Estrutura e Módulos Desenvolvidos

### 1. Autenticação & Segurança (Backend)
- [backend/app.py](file:///c:/Users/Bruza/OneDrive/Área de Trabalho/Agenda Médica/backend/app.py) - Servidor Flask principal.
- [backend/auth.py](file:///c:/Users/Bruza/OneDrive/Área de Trabalho/Agenda Médica/backend/auth.py) - Endpoint `POST /api/login` com validação de payload.
- [backend/models.py](file:///c:/Users/Bruza/OneDrive/Área de Trabalho/Agenda Médica/backend/models.py) & [seed.py](file:///c:/Users/Bruza/OneDrive/Área de Trabalho/Agenda Médica/backend/seed.py) - Modelo SQLite e carga inicial do usuário administrador.
- [backend/test_auth.py](file:///c:/Users/Bruza/OneDrive/Área de Trabalho/Agenda Médica/backend/test_auth.py) - Suíte de testes com Pytest (HTTP 200, 401, 400).

### 2. Mock API de Agendamentos
- [mock-api/app.py](file:///c:/Users/Bruza/OneDrive/Área de Trabalho/Agenda Médica/mock-api/app.py) - Endpoint `GET /api/agendamentos`.
- [mock-api/agendamentos.json](file:///c:/Users/Bruza/OneDrive/Área de Trabalho/Agenda Médica/mock-api/agendamentos.json) - Base mock com agendamentos completos (Paciente, CPF, Médico, Especialidade, Data, Horário, Convênio, Status).

### 3. Frontend Angular
- [AuthService](file:///c:/Users/Bruza/OneDrive/Área de Trabalho/Agenda Médica/frontend/src/app/services/auth.service.ts) - Comunicação HTTP com o backend de Login e gestão de `localStorage`.
- [AgendaService](file:///c:/Users/Bruza/OneDrive/Área de Trabalho/Agenda Médica/frontend/src/app/services/agenda.service.ts) - Consumo resiliente da Mock API com sanitização de campos e timeouts.
- [AuthGuard](file:///c:/Users/Bruza/OneDrive/Área de Trabalho/Agenda Médica/frontend/src/app/guards/auth.guard.ts) - Proteção de rotas restritas.
- [AuthInterceptor](file:///c:/Users/Bruza/OneDrive/Área de Trabalho/Agenda Médica/frontend/src/app/interceptors/auth.interceptor.ts) - Injeção do token JWT nas requisições.
- [LoginComponent](file:///c:/Users/Bruza/OneDrive/Área de Trabalho/Agenda Médica/frontend/src/app/components/login/login.component.ts) - Formulário reativo e feedback de erro.
- [AgendaComponent](file:///c:/Users/Bruza/OneDrive/Área de Trabalho/Agenda Médica/frontend/src/app/components/agenda/agenda.component.ts) - Tabela Tabulator, busca em tempo real e simuladores de erro para teste de resiliência.
