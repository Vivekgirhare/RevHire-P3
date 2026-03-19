# RevHire Microservices — Spring Cloud Integration

## Architecture Overview

```
                          ┌─────────────────────┐
                          │   Eureka Server      │  :8761
                          │  (Service Registry)  │
                          └──────────┬──────────┘
                                     │ register/discover
         ┌───────────────────────────┼──────────────────────────┐
         │                           │                           │
    ┌────▼─────┐              ┌──────▼──────┐            ┌──────▼──────┐
    │ API GW   │──lb://──────▶│  Services   │◀──Feign────│  Services   │
    │  :8080   │              │(job,auth,..)│            │(app,profile)│
    └──────────┘              └─────────────┘            └─────────────┘
         │
    ┌────▼─────────────┐
    │  Angular Frontend │  :4200
    └──────────────────┘
```

## Services & Ports

| Service                  | Port | Description                       |
|--------------------------|------|-----------------------------------|
| **eureka-server**        | 8761 | Service discovery                 |
| **api-gateway**          | 8080 | Gateway + In-Memory Rate Limiter + Circuit Breaker |
| **auth-service**         | 8081 | Authentication & JWT              |
| **job-service**          | 8082 | Job posting & search              |
| **application-service**  | 8083 | Job applications                  |
| **profile-service**      | 8084 | Job seeker profiles               |
| **company-service**      | 8085 | Employer company profiles         |
| **notification-service** | 8086 | Notifications                     |

## Prerequisites

- Java 17+
- Maven 3.8+
- MySQL 8.x running on port 3306 (user: `root`, password: `root`)
  > If your MySQL password differs, update `spring.datasource.password` in each service's `application.properties`
- Node.js 18+ and Angular CLI (`npm install -g @angular/cli`)

## Quick Start

### Step 1 — Create databases
```bash
mysql -u root -p < create_databases.sql
```

### Step 2 — Start services IN ORDER (each in its own terminal)
```bash
# 1. Eureka Server (MUST be first)
cd eureka-server && mvn spring-boot:run

# 2. API Gateway
cd api-gateway && mvn spring-boot:run

# 3. Auth Service
cd auth-service && mvn spring-boot:run

# 4. Profile Service
cd profile-service && mvn spring-boot:run

# 5. Company Service
cd company-service && mvn spring-boot:run

# 6. Job Service
cd job-service && mvn spring-boot:run

# 7. Application Service
cd application-service && mvn spring-boot:run

# 8. Notification Service
cd notification-service && mvn spring-boot:run
```

### Step 3 — Verify Eureka
Open http://localhost:8761 — all 7 services (not eureka itself) should show **UP**

> **Wait ~30 seconds** after all services start before testing — Eureka needs time to sync registrations.

### Step 4 — Start Frontend
```bash
cd frontend-updated
npm install
ng serve
```
Open http://localhost:4200

## Spring Cloud Features

| Feature | Implementation |
|---|---|
| **Service Discovery** | Eureka Server + `@EnableDiscoveryClient` on all services |
| **API Routing** | Spring Cloud Gateway with `lb://service-name` load-balanced URIs |
| **Rate Limiting** | Custom in-memory Token Bucket filter (20 req/s, burst 40) — no Redis needed |
| **Circuit Breaker** | Resilience4j on all Gateway routes + all Feign inter-service calls |
| **Service-to-Service** | OpenFeign clients with circuit breaker fallbacks in all services |
| **JWT Auth** | Gateway validates JWT and forwards `X-User-Id`, `X-User-Role` headers |

## Running Tests
```bash
cd auth-service && mvn test
cd job-service && mvn test
cd application-service && mvn test
```
