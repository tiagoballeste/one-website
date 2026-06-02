# Runbook Operacional

## Status dos Containers

```bash
ssh root@<VPS_IP>
cd /opt/one-website
docker compose ps
```

## Logs

Site:

```bash
cd /opt/one-website
docker compose logs -f one-website
```

Caddy:

```bash
cd /opt/one-website
docker compose logs -f one-caddy
```

## Reiniciar Somente o Site

```bash
cd /opt/one-website
docker compose restart one-website
```

## Reiniciar Somente o Caddy

```bash
cd /opt/one-website
docker compose restart one-caddy
```

## Rebuild do Site

```bash
cd /opt/one-website
git pull --ff-only origin master
docker compose build one-website
docker compose up -d one-website
```

## Validar Site

```bash
curl -sS -o /dev/null -w "site:%{http_code}\n" http://127.0.0.1:3001
```

## Validar Integração com Backend

```bash
docker exec one-website node -e 'fetch("http://one-api:8000/v1/health").then(async r=>{console.log(r.status, await r.text())}).catch(e=>{console.error(e); process.exit(1)})'
```

## Validar HTTPS

```bash
curl -I https://onefiancalocaticia.com.br
curl -I https://www.onefiancalocaticia.com.br
```

## Ver Portas

```bash
ss -tulpn | grep -E ':80|:443|:3001|:8000|:15432'
```

Esperado para o site:

```txt
80/443 publicados por one-caddy
127.0.0.1:3001 publicado por one-website
```

## Rollback Rapido

```bash
cd /opt/one-website
git log --oneline -5
git reset --hard <commit_anterior>
docker compose build one-website
docker compose up -d one-website
```

## Parar Site

```bash
cd /opt/one-website
docker compose down
```

Isso para `one-website` e `one-caddy`, mas nao deve parar backend, banco ou Hermes.
