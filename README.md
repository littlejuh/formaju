# 🎓 Site da Formatura — Sistemas de Informação

Landing page da formatura com **contagem regressiva**, **informações do evento** (com botão "adicionar à agenda"),
**linha do tempo da graduação**, **galeria de fotos**, **lista de presença** e **mural de recados**.

- Colação de grau: **27/02/2027, 15h — Anfiteatro Padre Werner**
- Festa: **28/02/2027**

No ar em **https://formaturadaju.com.br** (painel: https://formaturadaju.com.br/admin).

Feito em Node + Express, sem banco de dados externo: tudo fica salvo em `data/db.json`.

## Rodar local

```bash
npm install
npm start          # ou: npm run dev  (reinicia ao salvar)
```

- Site: http://localhost:3000
- Painel da lista de presença: http://localhost:3000/admin (senha padrão: `formatura2027`)

## Personalizar

| O quê | Onde |
| --- | --- |
| Nome, textos de boas-vindas, linha do tempo, horário/local da festa | `public/config.js` |
| Fotos da galeria | Coloque as imagens em `public/fotos/` |
| Inspirações (pessoas e fotos) | `inspiracoes` em `public/config.js` + imagens em `public/inspiracoes/` |
| PDF do TCC | `public/docs/` + item `tcc` em `public/config.js` |
| Cores | Variáveis no topo de `public/styles.css` |

**Fotos:** a ordem segue o nome do arquivo e a legenda vem do nome também.
Ex.: `01-primeiro-dia.jpg` aparece primeiro com a legenda "primeiro dia".
Dica: reduza as fotos para ~1600px de largura antes de subir, para o site carregar rápido.

## Painel admin (`/admin`)

- Ver todas as confirmações (com contato, acompanhantes e mensagem privada)
- Totais de pessoas na colação e na festa (contando acompanhantes)
- Baixar a lista como planilha CSV (abre no Excel / Google Sheets)
- Ocultar ou apagar recados do mural

## Variáveis de ambiente

| Variável | Padrão | Para quê |
| --- | --- | --- |
| `ADMIN_PASSWORD` | `formatura2027` | Senha do painel. **Troque em produção!** |
| `DATA_DIR` | `./data` | Pasta onde fica o `db.json` (aponte para um volume persistente) |
| `PORT` | `3000` | Porta HTTP |

## Deploy

O app precisa de **disco persistente** para não perder as confirmações e recados quando reiniciar.

### Railway (recomendado — mais simples)

1. Suba esta pasta para um repositório no GitHub.
2. No [Railway](https://railway.app): **New Project → Deploy from GitHub repo**. Ele detecta o `Dockerfile` sozinho.
3. Em **Variables**, adicione `ADMIN_PASSWORD` com uma senha sua.
4. Clique com o botão direito no serviço → **Attach Volume** → mount path: `/data`.
5. Em **Settings → Networking → Generate Domain** para ter a URL pública.

#### Domínio próprio

O site usa o domínio `formaturadaju.com.br`, com DNS na Cloudflare:

| Registro | Nome | Valor |
| --- | --- | --- |
| `CNAME` | `@` | `tjirk75w.up.railway.app` |
| `CNAME` | `www` | `tjirk75w.up.railway.app` |
| `TXT` | `_railway-verify` | token mostrado pelo Railway ao adicionar o domínio |

No Railway, o domínio é adicionado em **Settings → Networking → Custom Domain**; o certificado HTTPS é emitido automaticamente.

### Render

1. **New → Web Service** apontando para o repositório (runtime Docker).
2. Adicione um **Disk** com mount path `/data` (disco exige plano pago; no plano free os dados somem a cada deploy).
3. Defina `ADMIN_PASSWORD`.

### Fly.io

```bash
fly launch --no-deploy
fly volumes create dados --size 1
# no fly.toml adicione:
# [mounts]
#   source = "dados"
#   destination = "/data"
fly secrets set ADMIN_PASSWORD=sua-senha
fly deploy
```

### Backup

Baixe o CSV pelo painel de vez em quando — ou copie o arquivo `db.json` do volume.
