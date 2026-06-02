# DNS Locaweb

## Registros do Site

O dominio principal deve apontar para a VPS:

```txt
.    A      177.7.39.70
www  CNAME  onefiancalocaticia.com.br
```

Em alguns paineis o registro raiz aparece como `@` em vez de `.`.

## Nao Alterar E-mail

Nao remover nem alterar registros relacionados a e-mail:

```txt
MX
TXT SPF
TXT DMARC
autodiscover
smtp
pop
imap
mail
webmail
mobile
```

## FTP

Se existir:

```txt
ftp CNAME onefiancalocaticia.com.br
```

entao `ftp.onefiancalocaticia.com.br` tambem apontara para a VPS depois que o dominio raiz apontar para a VPS.

Se ainda for necessario usar FTP antigo da Locaweb, usar dominio temporario da hospedagem antiga ou criar um apontamento especifico para FTP.

## SSL com Caddy

O `one-caddy` emite certificado automaticamente quando:

- DNS publico ja aponta para a VPS.
- Portas 80 e 443 estao abertas.
- Caddy esta rodando.

Validar DNS:

```bash
dig +short onefiancalocaticia.com.br
dig +short www.onefiancalocaticia.com.br
```

Esperado:

```txt
177.7.39.70
```

Validar HTTPS:

```bash
curl -I https://onefiancalocaticia.com.br
curl -I https://www.onefiancalocaticia.com.br
```

## Propagação

Durante propagacao, alguns resolvedores podem retornar o IP novo e outros o IP antigo.

Sintomas comuns:

- navegador ainda mostra Locaweb;
- HTTPS com erro temporario;
- Caddy loga tentativas ACME contra IP antigo.

Nesse caso, aguardar a propagacao ou testar com `/etc/hosts` local:

```txt
177.7.39.70 onefiancalocaticia.com.br www.onefiancalocaticia.com.br
```
