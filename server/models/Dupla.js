/**
 * Model: Duplas - CRUD por torneio.
 */
const db = require('../database/db');

function listar(torneioId) {
  if (torneioId != null) {
    return db.prepare('SELECT id, torneio_id, nome FROM duplas WHERE torneio_id = ? ORDER BY nome').all(torneioId);
  }
  return db.prepare('SELECT id, torneio_id, nome FROM duplas ORDER BY nome').all();
}

function obterPorId(id) {
  return db.prepare('SELECT id, torneio_id, nome FROM duplas WHERE id = ?').get(id);
}

function criar(nome, torneioId) {
  const result = db.prepare('INSERT INTO duplas (torneio_id, nome) VALUES (?, ?)').run(torneioId, nome);
  return result.lastInsertRowid;
}

function atualizar(id, nome) {
  return db.prepare('UPDATE duplas SET nome = ? WHERE id = ?').run(nome, id);
}

function apagar(id) {
  return db.prepare('DELETE FROM duplas WHERE id = ?').run(id);
}

module.exports = {
  listar,
  obterPorId,
  criar,
  atualizar,
  apagar
};
