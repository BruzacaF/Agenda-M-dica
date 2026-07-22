# Agenda Médica - Sistema de Agendamentos

Este repositório contém o projeto **Agenda Médica**, uma aplicação estruturada para consulta e gestão de agendamentos médicos. A aplicação integra um frontend em **Angular 17** com dois microsserviços backend independentes desenvolvidos em **Python/Flask**.

---

## 🏗️ Arquitetura do Sistema e Conexão entre APIs

A aplicação foi desenhada utilizando uma arquitetura orientada a serviços e totalmente conteinerizada via **Docker**, promovendo um isolamento completo e facilidade de deploy. A comunicação entre o frontend e os microsserviços ocorre de forma transparente e segura através de tokens JWT.

### Fluxo de Comunicação e Autenticação

1. **Autenticação (Backend API)**: O Frontend envia as credenciais de login para a API Principal (`/api/login`). O Backend valida os dados no banco de dados SQLite e retorna um token JWT (JSON Web Token) criptografado com uma chave secreta (`JWT_SECRET_KEY`).
2. **Gerenciamento de Sessão (Frontend)**: O token JWT é armazenado localmente no navegador (`localStorage`). Um interceptor do Angular (`AuthInterceptor`) é responsável por anexar automaticamente este token no cabeçalho (`Authorization: Bearer <token>`) de todas as requisições subsequentes.
3. **Consulta de Dados (Mock API)**: Quando o Frontend solicita a lista de agendamentos (`/api/agendamentos`), a Mock API intercepta a requisição, valida a integridade e expiração do token JWT usando a mesma chave secreta e, somente se válido, retorna os dados mockados sincronizados.

---

## 📚 Módulos Desenvolvidos (O que cada um faz)

### 1. 🛡️ Backend Principal (API de Autenticação)
**Função simplificada:** É o "porteiro" do sistema. Valida quem está tentando acessar a aplicação.
- Desenvolvido em Flask com banco de dados **SQLite**.
- Armazena os usuários do sistema com senhas protegidas por criptografia (Hash `werkzeug.security`).
- Fornece o endpoint de autenticação (`POST /api/login`) para validação de credenciais e geração da chave de acesso (JWT).

### 2. 🏥 Serviço de Agendamentos (Mock API)
**Função simplificada:** É o "fornecedor de dados" (Data Provider). Atua como um sistema externo de gestão hospitalar, fornecendo e manipulando uma vasta massa de dados de agendamentos para consumo da interface.
- **Arquitetura e Segurança:** Desenvolvido em Flask, roda em contêiner isolado (porta 5001) e todas as rotas sensíveis são protegidas pela exigência e validação estrita do token JWT.
- **Motor de Geração de Dados (Como o Mock funciona):** Ao ser inicializado, o sistema aciona um motor interno capaz de criar **1.000 registros sintéticos realistas** de agendamentos. Para injetar "caos controlado" e permitir o teste de resiliência da interface, o motor deixa intencionalmente **dados ausentes** em parcelas do banco (ex: ~5% das consultas não possuem CPF, ~3% não possuem médico assinalado, etc.).
- **Persistência Dinâmica (Conexão entre APIs):** O Mock não é puramente efêmero. Ele grava, carrega e sincroniza continuamente esses 1.000 registros dentro da tabela `agendamentos` do mesmo **banco de dados SQLite** consumido pela API principal, criando um ecossistema persistente e interconectado.
- **Operações Avançadas:** Suporta paginação server-side nativa (`page`, `limit`), filtros independentes e rigorosos (`paciente`, `cpf`, `medico`), e parâmetros especiais de teste de injeção de falhas (`?fail=true`, `?empty=true`, `?incomplete=true`).

### 3. 💻 Frontend SPA (Angular 17)
**Função simplificada:** É a "vitrine interativa" do sistema. Orquestra a exibição de dados, a navegação do usuário e intercepta as comunicações de rede garantindo que tudo funcione perfeitamente de ponta a ponta.
- **Interface e Componentes (UX/UI):** Combina o uso prático de componentes robustos do **Angular Material** (como `MatFormField`, `MatInput`, `MatButton`, `MatIcon`, `MatTabs` e cards) com customizações avançadas em **CSS3 Vanilla**. Essa mescla garante acessibilidade e interatividade nativa (ex: animações em inputs e botões) ao mesmo tempo que aplica visuais customizados modernos, como o *Glassmorphism* translúcido no login e a *Navbar de Alto Contraste* na tela da Agenda.
- **Gestão de Tabela e Dados:** Integrado com a robusta biblioteca Javascript **Tabulator** para renderizar de forma fluída os 1.000 registros. O Frontend higieniza ativamente os dados corrompidos da Mock API, transformando propriedades `null` ou vazias em marcadores visuais atenuados e formatados (ex: `---` em itálico ou `Paciente Não Identificado`).
- **Segurança e Interceptadores:** Possui `AuthGuard` para blindar o roteamento (impedindo acessos anônimos à Agenda) e um poderoso `AuthInterceptor` que "carimba" automaticamente todos os pacotes HTTP enviados para o backend ou para a Mock API com o cabeçalho seguro (`Authorization: Bearer`).
- **Tratamento Humanizado de Exceções:** Uma sofisticada malha de captura de erros (`catchError`) converte códigos HTTP brutos (`401 Unauthorized`, `500 Internal Error`, `0 Connection Refused`) em mensagens totalmente empáticas e amigáveis na UI, alternando botões contextualmente (ex: sugerindo a ação "Ir para o Login" quando identifica que a sessão foi expirada).

---

## 🧪 Ambiente de Teste e Simulador de Falhas

Uma funcionalidade exclusiva do Frontend é o **Painel "Ambiente de Teste"**. Como a arquitetura depende de chamadas de rede e da integridade dos dados, o Frontend expõe botões que permitem ao testador simular em tempo real como a interface gráfica reage sob estresse e cenários anormais de uso:
- **Simular Erro 500:** Força a Mock API (ou a API de Login) a retornar um erro interno proposital, exibindo alertas amigáveis de "Instabilidade no sistema".
- **Simular Lista Vazia:** Força a API de agendamentos a devolver 0 registros para visualizar e validar o layout de *fallback* da tabela de consultas.
- **Simular API Offline:** Redireciona de forma proposital a requisição para uma porta inexistente, simulando quedas de internet ou servidores fora do ar (Network Error / Timeout).
- **Excluir Token JWT:** Apaga a chave secreta de acesso do navegador durante o uso da plataforma para testar o bloqueio por sessão expirada (erro `HTTP 401 Unauthorized`) e forçar a re-autenticação.
- **Exibir Registros Incompletos:** Filtra os 1.000 registros e exibe apenas a minoria de consultas com falhas de cadastro/dados nulos. Esse botão demonstra as defesas visuais da tabela e como o `Angular` processa dados `null` vindos do backend.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: Angular 17, Angular Material, Tabulator Tables, RxJS, HTML5, CSS3.
- **Backend & Mock API**: Python 3.11, Flask, PyJWT, SQLite, Werkzeug Security, Pytest.
- **DevOps**: Docker, Docker Compose.

---

## 🚀 Como Iniciar o Projeto (Docker Compose)

Certifique-se de possuir o **Docker** e o **Docker Compose** instalados na sua máquina.

Na raiz do repositório, execute o comando para *build* (construção) e inicialização simultânea dos contêineres:

```bash
docker-compose up --build
```

Após o carregamento, os serviços estarão acessíveis nos seguintes endereços:
- **Frontend SPA**: [http://localhost:4200](http://localhost:4200)
- **Backend API (Login)**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Mock API (Agendamentos)**: [http://localhost:5001/api/agendamentos/health](http://localhost:5001/api/agendamentos/health)

---

## 🔑 Credenciais de Acesso

Para autenticação na tela de login ([http://localhost:4200/login](http://localhost:4200/login)):

- **E-mail**: `admin@agendamedica.com.br`
- **Senha**: `AdminPassword123`
