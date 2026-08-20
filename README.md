## ENGLISH README

# 📦 Order Processing System

A high-performance distributed backend system designed for asynchronous order processing and real-time inventory management, built with **NestJS**, **PostgreSQL**, **Redis**, and **RabbitMQ**.

---

## 🏛️ System Architecture

[HTTP Client / Swagger]
│
▼ (POST /orders - HTTP 202 Accepted)
┌──────────────────────────────────────────────────────────┐
│                   NestJS API (Producer)                  │
│  - Request Validation & Idempotency Checks (PostgreSQL)  │
│  - Event Emission (RabbitMQ)                             │
│  - Cache-Aside Strategy (Redis)                          │
└──────────────┬───────────────────────────┬───────────────┘
│                           │
▼                           ▼
┌─────────────────┐         ┌─────────────────┐
│   PostgreSQL    │         │      Redis      │
│ (ACID & Storage)│         │ (In-Memory Data)│
└────────▲────────┘         └────────▲────────┘
│                           │
│  Consumes event           │ Invalidates cache
│  and updates stock        │
┌──────────────┴───────────────────────────┴───────────────┐
│                 NestJS Worker (Consumer)                 │
│  - Listens to 'orders_queue'                             │
│  - Simulates Payment Processing                          │
│  - Executes Atomic Database Transactions                 │
│  - Message Acknowledgment (ACK)                          │
└──────────────────────────────────────────────────────────┘


---

## 🚀 Key Features & Architectural Decisions

* **Asynchronous Decoupling:** Long-running operations (payment simulation, stock reconciliation) are processed in the background via RabbitMQ, ensuring immediate `202 Accepted` response times (< 25ms).
* **Distributed Caching (Cache-Aside):** Product catalog queries are cached in Redis with active invalidation whenever an order completes.
* **Idempotency Guarantee:** Prevents duplicate charges and order processing using client-provided idempotency keys validated against PostgreSQL transactional records.
* **ACID-Compliant Transactions:** Atomically manages order states and inventory decrements using dedicated connection pooling in PostgreSQL.
* **Multi-Stage Containerization:** Production-ready Alpine Docker image configured with least-privilege non-root execution (`USER node`) and a trimmed runtime bundle.
* **Automated CI Pipeline:** GitHub Actions workflow executing code quality checks, TypeScript compilation, and multi-stage Docker build validation on every push and pull request.

---

## 🛠️ Tech Stack

* **Runtime & Framework:** Node.js 20, NestJS, TypeScript
* **Relational Database:** PostgreSQL 16
* **Distributed Cache:** Redis 7 (Alpine)
* **Message Broker:** RabbitMQ 3.13 (Management Alpine)
* **API Documentation:** Swagger / OpenAPI
* **Containerization:** Docker, Docker Compose (Multi-stage build)
* **Continuous Integration:** GitHub Actions

---

## ⚡ Quick Start

### Prerequisites
* [Docker Desktop](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) installed.

### Running the Entire Infrastructure & API
Clone the repository and launch all services with a single command:

# Clone the repository
git clone [https://github.com/SEU-USUARIO/OrderProcessingSystem.git](https://github.com/SEU-USUARIO/OrderProcessingSystem.git)
cd OrderProcessingSystem

# Build and start all services in detached mode
docker compose up --build -d

---

## 🌐 Endpoints & Service Portals

Interactive Swagger UI: http://localhost:3000/api/docs --- Public
RabbitMQ Management Dashboard: http://localhost:15672 --- guest / guest
PostgreSQL: localhost:5432 --- postgres / postgres123 (DB: orders_db)
Redis: localhost:6379 --- No Password (local)

---

## 🧪 Testing the Asynchronous Workflow
1. Open the Swagger UI at http://localhost:3000/api/docs.

2. Send a GET /products request to view available stock and populate the Redis cache.

3. Send a POST /orders request with a unique idempotencyKey and valid productId:
{
  "customerEmail": "user@example.com",
  "idempotencyKey": "order-test-uuid-001",
  "items": [
    {
      "productId": "PASTE-PRODUCT-UUID-HERE",
      "quantity": 2
    }
  ]
}

4. Observe the immediate 202 Accepted response.

5. Track real-time worker processing, payment simulation, and cache invalidation in the terminal:
    docker compose logs -f api

6. Check GET /orders/{id} to verify that the order status transitions from PENDING to COMPLETED.

---

## README PORTUGUÊS

# 📦 Order Processing System

Sistema distribuído de alto desempenho para processamento assíncrono de pedidos e controle de estoque, construído com **NestJS**, **PostgreSQL**, **Redis** e **RabbitMQ**.

---

## 🏛️ Arquitetura do Sistema

[Cliente HTTP / Swagger]
│
▼ (POST /orders - HTTP 202 Accepted)
┌──────────────────────────────────────────────────────────┐
│                   NestJS API (Producer)                  │
│  - Validação de DTOs & Idempotência (PostgreSQL)         │
│  - Publicação de Eventos (RabbitMQ)                      │
│  - Estratégia de Caching Cache-Aside (Redis)             │
└──────────────┬───────────────────────────┬───────────────┘
│                           │
▼                           ▼
┌─────────────────┐         ┌─────────────────┐
│   PostgreSQL    │         │      Redis      │
│ (ACID & Storage)│         │ (In-Memory Data)│
└────────▲────────┘         └────────▲────────┘
│                           │
│  Consome evento           │ Invalida cache
│  e abate estoque          │
┌──────────────┴───────────────────────────┴───────────────┐
│                 NestJS Worker (Consumer)                 │
│  - Escuta fila 'orders_queue'                            │
│  - Simulação de Gateway de Pagamento                     │
│  - Transação Atômica de baixa de estoque                 │
│  - Confirmação de Mensagem (ACK)                         │
└──────────────────────────────────────────────────────────┘


---

## 🚀 Tecnologias & Decisões Técnicas

* **Framework:** [NestJS](https://nestjs.com/) com TypeScript (Injeção de Dependências e Arquitetura Modular).
* **Banco Relacional:** [PostgreSQL 16](https://www.postgresql.org/) para persistência transacional ACID.
* **Cache Distribuído:** [Redis 7](https://redis.io/) aplicando padrão **Cache-Aside** e invalidação ativa.
* **Mensageria:** [RabbitMQ 3.13](https://www.rabbitmq.com/) com filas persistentes (`durable: true`) e desacoplamento assíncrono.
* **Documentação de API:** [Swagger / OpenAPI](http://localhost:3000/api/docs).
* **Conteinerização:** Docker & Docker Compose com **Multi-Stage Build** e imagens Alpine não-root.
* **CI/CD:** GitHub Actions para validação automatizada de código e build de containers.

---

## 🛠️ Como Executar

### Pré-requisitos
* [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/) instalados.

### Executando todo o ecossistema
Clone o repositório e inicie todos os serviços com um único comando:

# Clone o repositório
git clone [https://github.com/lguilhermelb1/OrderProcessingSystem.git](https://github.com/lguilhermelb1/OrderProcessingSystem.git)
cd OrderProcessingSystem

# Suba a infraestrutura e a API conteinerizada
docker compose up --build -d

---

## 🌐 Endpoints & Painéis de Acesso
Documentação Swagger: http://localhost:3000/api/docs --- Acesso público
RabbitMQ Management Dashboard: http://localhost:15672 --- guest / guest
PostgreSQL: localhost:5432 --- postgres / postgres123 (DB: orders_db)
Redis: localhost:6379 --- Sem senha (local)

---

## 🧪 Testando o Fluxo Assíncrono
1. Abra o Swagger em http://localhost:3000/api/docs.

2. Execute o endpoint GET /products para consultar os itens cadastrados e verificar o funcionamento do cache no Redis.

3. Dispare uma requisição POST /orders informando uma idempotencyKey única e um productId válido:
{
  "customerEmail": "user@example.com",
  "idempotencyKey": "order-test-uuid-001",
  "items": [
    {
      "productId": "COLE-PRODUTO-UUID-AQUI",
      "quantity": 2
    }
  ]
}

4. A API retornará imediatamente status 202 Accepted.

5. Acompanhe o processamento do Worker em tempo real:
    docker compose logs -f api

6. Observe o endpoint GET /orders/{id} para verificar a transição de status de PENDING para COMPLETED.

---