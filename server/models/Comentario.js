/**
 * Model: Comentários por partida.
 */
const db = require('../database/db');

function listarPorPartida(partidaId) {
  return db.prepare(
    'SELECT id, partida_id, autor_nome, texto, created_at FROM comentarios WHERE partida_id = ? ORDER BY created_at ASC'
  ).all(partidaId);
}

function criar(partidaId, { autor_nome, texto }) {
  const autor = (autor_nome != null && String(autor_nome).trim() !== '') ? String(autor_nome).trim() : null;
  const result = db.prepare(
    'INSERT INTO comentarios (partida_id, autor_nome, texto) VALUES (?, ?, ?)'
  ).run(partidaId, autor, texto);
  const row = db.prepare('SELECT id, partida_id, autor_nome, texto, created_at FROM comentarios WHERE id = ?').get(result.lastInsertRowid);
  return row;
}

module.exports = {
  listarPorPartida,
  criar
};
