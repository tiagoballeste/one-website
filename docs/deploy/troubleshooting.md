# Troubleshooting

## Site nao abre no dominio

Checar DNS:

```bash
dig +short onefiancalocaticia.com.br
dig +short www.onefiancalocaticia.com.br
```

Esperado:

```txt
177.7.39.70
```

Checar Caddy:

```bash
cd /opt/one-website
docker compose ps
docker compose logs --tail=120 one-caddy
```

## Navegador mostra pagina da Locaweb

Provavel DNS/cache ainda apontando para IP antigo.

Validar em diferentes resolvedores:

```bash
dig @8.8.8.8 +short onefiancalocaticia.com.br
dig @1.1.1.1 +short onefiancalocaticia.com.br
```

Se algum resolvedor ainda retornar IP antigo, aguardar propagacao.

## HTTPS com erro SSL

Possiveis causas:

- DNS ainda nao propagou para a VPS.
- Portas 80/443 bloqueadas.
- Caddy ainda esta aguardando retry ACME.

Ver logs:

```bash
cd /opt/one-website
docker compose logs --tail=200 one-caddy
```

Se DNS ja estiver correto por varios minutos, reiniciar apenas Caddy:

```bash
docker compose restart one-caddy
```

## Site local na VPS retorna 000 ou connection reset

Pode acontecer logo apos recriar o container. Aguardar alguns segundos e testar:

```bash
sleep 5
curl -sS -o /dev/null -w "site:%{http_code}\n" http://127.0.0.1:3001
```

Se persistir:

```bash
docker compose logs --tail=120 one-website
```

## Formulario retorna 502

O Next.js nao conseguiu falar com o backend.

Checar `.env`:

```bash
cd /opt/one-website
grep ONE_BACKEND_URL .env
```

Em producao deve ser:

```env
ONE_BACKEND_URL=http://one-api:8000
```

Checar rede Docker:

```bash
docker network inspect one-fianca-backend_one_public
docker inspect one-website --format '{{json .NetworkSettings.Networks}}'
```

Checar backend de dentro do site:

```bash
docker exec one-website node -e 'fetch("http://one-api:8000/v1/health").then(async r=>{console.log(r.status, await r.text())}).catch(e=>{console.error(e); process.exit(1)})'
```

## Formulario retorna 422

Isso geralmente indica payload invalido ou schema do backend exigindo campos.

Checar resposta no Network do navegador e comparar com a documentacao do backend.

## Docker Compose nao encontra rede externa

Erro comum:

```txt
network one-fianca-backend_one_public declared as external, but could not be found
```

O backend precisa estar implantado antes, criando a rede.

Validar:

```bash
docker network ls | grep one-fianca-backend_one_public
```

Se a rede nao existir, nao suba o site ate revisar o deploy do backend.

## Git pull falha por alteracoes locais

Se `/opt/one-website` tiver alteracoes locais indesejadas:

```bash
cd /opt/one-website
git status --short
git reset --hard origin/master
```

Atencao: isso descarta alteracoes locais versionaveis. Nao remove `.env`, porque `.env` e ignorado.
