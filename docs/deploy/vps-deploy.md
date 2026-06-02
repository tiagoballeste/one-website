# Deploy na VPS

## Pre-requisitos

Na maquina local do developer:

- Git
- SSH
- acesso ao repositorio `tiagoballeste/one-website`
- arquivo de credenciais da VPS recebido fora do Git

Na VPS:

- Docker
- Docker Compose
- pasta `/opt/one-website`
- rede Docker `one-fianca-backend_one_public`
- backend `one-api` rodando

## Arquivos Sensíveis Necessários

O developer precisa receber fora do Git:

```txt
backend/vps.env
backend/ops.env
one-website/.env
```

Detalhes em [env-files.md](env-files.md).

## Primeiro Deploy

```bash
ssh root@<VPS_IP>
cd /opt
git clone https://github.com/tiagoballeste/one-website.git /opt/one-website
cd /opt/one-website
```

Criar `/opt/one-website/.env`:

```env
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://onefiancalocaticia.com.br
ONE_BACKEND_URL=http://one-api:8000
```

Validar:

```bash
docker compose config
docker compose build
docker compose up -d
docker compose ps
```

## Deploy de Atualização

```bash
ssh root@<VPS_IP>
cd /opt/one-website
git pull --ff-only origin master
docker compose build one-website
docker compose up -d one-website
docker compose ps
```

Se houver alteracao em `Caddyfile` ou `docker-compose.yml`, suba tudo:

```bash
docker compose up -d
```

## Validação Pós-Deploy

Site no host da VPS:

```bash
curl -sS -o /dev/null -w "site:%{http_code}\n" http://127.0.0.1:3001
```

Backend visto de dentro do container:

```bash
docker exec one-website node -e 'fetch("http://one-api:8000/v1/health").then(async r=>{console.log(r.status, await r.text())}).catch(e=>{console.error(e); process.exit(1)})'
```

Dominio:

```bash
curl -I https://onefiancalocaticia.com.br
curl -I https://www.onefiancalocaticia.com.br
```

## Rollback

Rollback simples para commit anterior:

```bash
cd /opt/one-website
git log --oneline -5
git reset --hard <COMMIT_ANTERIOR>
docker compose build one-website
docker compose up -d one-website
```

Parar apenas o site e proxy:

```bash
cd /opt/one-website
docker compose down
```

Isso nao derruba o backend nem o Hermes.

## Regras de Segurança

- Nao alterar `/opt/one-fianca-backend` sem autorizacao.
- Nao mexer no Hermes.
- Nao conectar o site ao PostgreSQL.
- Nao commitar `.env`.
- Nao publicar `one-api:8000` no browser via `NEXT_PUBLIC_*`.
