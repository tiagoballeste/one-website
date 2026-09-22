# Contrato do backend para simulações

O navegador usa apenas rotas relativas do Next.js. Em produção, essas rotas encaminham as solicitações para `ONE_BACKEND_URL`, sem expor o endereço interno do FastAPI.

## Endpoints esperados no FastAPI

### Criar simulação

`POST /v1/publico/simulacoes`

Recebe os dados normalizados do visitante, os valores calculados e:

```json
{
  "source": "website_simulation",
  "contactStatus": "awaiting_contact",
  "simulatedAt": "2026-09-18T12:00:00.000Z"
}
```

Deve criar ou associar o lead no One Leads e responder com um identificador estável:

```json
{
  "id": "sim_123"
}
```

### Atualizar simulação

`PATCH /v1/publico/simulacoes/{id}`

Recebe o mesmo payload completo. Deve atualizar a simulação e o lead associados ao identificador, sem criar um novo lead automaticamente.

### Registrar abertura do WhatsApp

`POST /v1/publico/simulacoes/{id}/whatsapp`

```json
{
  "contactStatus": "whatsapp_opened",
  "openedAt": "2026-09-18T12:05:00.000Z"
}
```

Esse evento registra somente que o visitante abriu a ação do WhatsApp; ele não confirma o envio da mensagem.

## Payload completo da simulação

Os campos monetários são números em reais, sem máscara. `whatsapp` contém 10 ou 11 dígitos nacionais, sem pontuação.

```json
{
  "fullName": "Ricardo Machado",
  "whatsapp": "11999999999",
  "rentAmount": 3000,
  "estimatedMonthlyInsurance": 300,
  "estimatedYearlyInsurance": 3600,
  "cashTotal": 3600,
  "fiveInstallmentValue": 792,
  "fiveInstallmentTotal": 3960,
  "twelveInstallmentValue": 345,
  "twelveInstallmentTotal": 4140,
  "source": "website_simulation",
  "contactStatus": "awaiting_contact",
  "simulatedAt": "2026-09-18T12:00:00.000Z"
}
```

## Desenvolvimento local

Quando o backend não está disponível ou responde que o endpoint ainda não existe, o Next.js retorna um identificador `local-*` somente em `NODE_ENV=development`. Esse comportamento permite revisar a interface localmente, não grava dados e nunca é ativado em produção.
