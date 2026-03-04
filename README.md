# Torneio de Padel

Sistema de gestão de torneio de padel no formato **todos contra todos** (grupo único), com pontuação por vitória.

## Stack

- **Backend:** Node.js + Express
- **Base de dados:** SQLite
- **Frontend:** HTML, CSS, JavaScript (Bootstrap 5)
- **Estrutura:** MVC

## Regras

- Partidas MD1 (melhor de 1 jogo), sem empate
- Vitória: 3 pontos | Derrota: 0 pontos
- Desempate: 1) Confronto direto 2) Saldo de games 3) Games ganhos

## Como rodar

```bash
npm install
npm start
```

Abrir no browser: **http://localhost:3000**

Ao iniciar, as duplas (Carlos e Nico, Diogo e Silveira, Avelar e Sant) e as partidas todos-contra-todos são criadas automaticamente. Basta registar os resultados das partidas.

## Estrutura

- `server/` – app.js, routes, controllers, models, database (schema + seed)
- `public/` – index.html, css, js (dashboard, classificação, partidas, registar resultado)

## API

- `GET /api/health` – health check (para Render)
- `GET/POST /api/torneios`, `GET /api/torneios/:id`, `POST /api/torneios/:id/gerar-partidas`, etc.
- `GET/POST /api/duplas`, `GET/PUT/DELETE /api/duplas/:id`
- `GET/POST /api/partidas`, `GET/PUT/DELETE /api/partidas/:id`, `POST /api/partidas/:id/resultado`
- `GET /api/classificacao` – classificação ordenada com desempate

## Deploy (Render + GitHub Pages)

O **GitHub Pages** só serve o frontend (HTML/CSS/JS). Para a app funcionar em produção:

1. **Backend no Render** (gratuito)
   - Entra em [render.com](https://render.com) e faz login com o GitHub.
   - **New** → **Web Service**; liga o repositório do projeto.
   - Render detecta Node: **Build Command** `npm install`, **Start Command** `npm start`.
   - Clica **Create Web Service**. O Render atribui um URL (ex.: `https://torneio-padel-api.onrender.com`).

2. **Frontend a apontar para a API**
   - No repositório, edita `public/js/config.js`.
   - Coloca o URL do teu serviço no Render, **terminado em `/api`**:
     ```js
     window.API_BASE_URL = 'https://torneio-padel-api.onrender.com/api';
     ```
   - Faz commit e push. O workflow do GitHub Pages volta a publicar o site; a partir daí o frontend usa a API no Render.

3. **Opcional:** em vez de criar o Web Service à mão, podes usar o **Blueprint**: no Render, **New** → **Blueprint** e conecta o repo; o ficheiro `render.yaml` configura o deploy.

**Nota:** No plano gratuito do Render, o servidor “adormece” após inatividade; o primeiro pedido pode demorar alguns segundos. A base SQLite no Render é efémera (os dados podem ser perdidos em novo deploy).
