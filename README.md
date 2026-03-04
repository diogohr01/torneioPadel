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

- `GET/POST /api/duplas`, `GET/PUT/DELETE /api/duplas/:id`
- `GET/POST /api/partidas`, `GET/PUT/DELETE /api/partidas/:id`, `POST /api/partidas/:id/resultado`
- `GET /api/classificacao` – classificação ordenada com desempate
