# Deploy do Site ONE

Esta pasta documenta o deploy do site Next.js da ONE Fiança Locatícia na VPS Hostinger.

## Objetivo

Publicar o site como aplicacao Next.js em Docker, preservando rotas internas `/api/...` e integracao server-side com o backend FastAPI.

## Topologia

```mermaid
flowchart LR
  internet[Internet] -->|80/443| caddy[one-caddy]
  caddy -->|3000 interno| website[one-website]
  website -->|http://one-api:8000| backend[one-api]
  backend --> postgres[(PostgreSQL)]

  subgraph one-website
    caddy
    website
  end

  subgraph one-fianca-backend
    backend
    postgres
  end
```

## Caminhos na VPS

| Item | Caminho |
| --- | --- |
| Site | `/opt/one-website` |
| Backend | `/opt/one-fianca-backend` |
| Compose do site | `/opt/one-website/docker-compose.yml` |
| Env do site | `/opt/one-website/.env` |

## Containers

| Container | Funcao |
| --- | --- |
| `one-website` | Next.js em producao |
| `one-caddy` | Reverse proxy e HTTPS automatico |
| `one-api` | Backend FastAPI existente |

## Redes Docker

| Rede | Uso |
| --- | --- |
| `one-website_one_site` | Rede interna entre Caddy e site |
| `one-fianca-backend_one_public` | Rede externa para o site falar com `one-api` |

## Ordem Recomendada

```mermaid
flowchart TD
  A[Confirmar acesso SSH] --> B[Entrar em /opt/one-website]
  B --> C[git pull origin master]
  C --> D[validar .env]
  D --> E[docker compose config]
  E --> F[docker compose build one-website]
  F --> G[docker compose up -d]
  G --> H[testar 127.0.0.1:3001]
  H --> I[testar HTTPS no dominio]
```

## Documentos

- [Deploy na VPS](vps-deploy.md)
- [DNS Locaweb](dns-locaweb.md)
- [Arquivos ignorados e variaveis](env-files.md)
- [Runbook operacional](runbook-operacional.md)
- [Troubleshooting](troubleshooting.md)
