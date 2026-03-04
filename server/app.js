/**
 * Servidor Express - Torneio de Padel.
 * Inicializa DB + seed, monta rotas API e serve frontend estático.
 */
const path = require('path');
const express = require('express');
const cors = require('cors');

// Garantir que o schema existe antes de qualquer acesso
require('./database/db');
const { runSeed } = require('./database/seed');

runSeed();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Frontend estático (public)
app.use(express.static(path.join(__dirname, '..', 'public')));

// API
app.use('/api/duplas', require('./routes/duplas'));
app.use('/api/partidas', require('./routes/partidas'));
app.use('/api/classificacao', require('./routes/classificacao'));

// SPA: qualquer rota não-API serve index.html
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ erro: 'Não encontrado' });
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log('Torneio Padel a correr em http://localhost:' + PORT);
});
