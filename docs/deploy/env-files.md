# Arquivos Ignorados, Variaveis e Credenciais

Este documento explica os arquivos que ficam fora do Git e quais dados o developer precisa receber para trabalhar e fazer deploy.

## Regra Geral

Nunca commitar:

- senhas;
- tokens;
- chaves SSH;
- arquivos `.env` reais;
- credenciais da VPS;
- credenciais de banco;
- dumps;
- logs sensiveis.

## Arquivos Ignorados no Repositorio do Site

O `.gitignore` do site ignora:

```gitignore
node_modules/
.next/
out/
build/
.env*
!.env.example
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
preloader-checks/
hero-checks/
.DS_Store
Thumbs.db
```

### `.env`

Arquivo real de variaveis do site.

Uso em producao na VPS:

```env
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://onefiancalocaticia.com.br
ONE_BACKEND_URL=http://one-api:8000
```

Por que fica fora do Git:

- pode conter configuracoes reais de ambiente;
- pode mudar por maquina;
- pode conter URLs internas ou segredos em fases futuras.

### `.env.local`

Arquivo local para desenvolvimento. Exemplo:

```env
ONE_BACKEND_URL=http://127.0.0.1:8000
```

Use quando o backend estiver rodando localmente.

### `.env.example`

Arquivo versionado e seguro. Ele mostra o formato esperado, sem segredo.

Este arquivo deve ficar no Git.

### `node_modules/`

Dependencias instaladas por `npm install`.

Nao commitar porque:

- e pesado;
- e recriado por `npm install` ou `npm ci`;
- depende do ambiente.

### `.next/`

Build e cache gerados pelo Next.js.

Nao commitar porque:

- e artefato de build;
- muda a cada build;
- pode incluir arquivos de runtime gerados.

### `out/` e `build/`

Artefatos de build/export.

Nao usar `output: "export"` neste projeto, porque as rotas `/api/...` precisam existir no servidor Next.js.

### Logs de npm/yarn/pnpm

Arquivos de erro locais. Podem conter caminhos e detalhes do ambiente.

### `.DS_Store` e `Thumbs.db`

Arquivos do sistema operacional. Nao fazem parte do projeto.

## Arquivos que o Developer Deve Receber Fora do Git

### Para desenvolver o site localmente

Arquivo:

```txt
one-website/.env
```

Conteudo recomendado se o backend estiver local:

```env
ONE_BACKEND_URL=http://127.0.0.1:8000
```

Conteudo recomendado se for usar backend publicado:

```env
ONE_BACKEND_URL=http://177.7.39.70:8000
```

### Para fazer deploy na VPS

Arquivos que o owner deve passar por canal seguro:

```txt
backend/vps.env
backend/ops.env
one-website/.env
```

`backend/vps.env` contem:

- IP/host da VPS;
- usuario SSH;
- senha ou instrucoes de acesso;
- dados reais do PostgreSQL.

`backend/ops.env` contem:

- host da VPS;
- usuario SSH;
- porta SSH;
- caminhos de deploy;
- informacoes operacionais usadas por scripts.

`one-website/.env` contem:

- variaveis reais de runtime do site.

## Variaveis do Site

| Variavel | Publica no browser? | Uso |
| --- | --- | --- |
| `NODE_ENV` | Nao | Define ambiente de runtime |
| `NEXT_PUBLIC_SITE_URL` | Sim | URL publica do site |
| `ONE_BACKEND_URL` | Nao | Base server-side para o backend |

## Atenção com `NEXT_PUBLIC_*`

Variaveis com prefixo `NEXT_PUBLIC_` ficam disponiveis no JavaScript enviado ao navegador.

Nao colocar nestas variaveis:

- tokens;
- senhas;
- URLs internas Docker como `http://one-api:8000`;
- credenciais.

`ONE_BACKEND_URL` nao deve ter prefixo `NEXT_PUBLIC_`, porque o navegador nao consegue resolver `one-api` e porque essa URL e de rede interna.

## Checklist de Entrega para Outro Developer

Enviar por canal seguro:

```txt
1. Acesso ao GitHub do repo tiagoballeste/one-website
2. backend/vps.env
3. backend/ops.env
4. one-website/.env
5. Instrucoes de SSH/chave/senha atualizadas
```

Nao enviar por GitHub publico:

```txt
1. Senha da VPS
2. Senha do banco
3. PAT do GitHub
4. Chaves SSH privadas
5. Dumps de banco
```
