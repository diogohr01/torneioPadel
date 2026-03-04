/**
 * Model: Torneios.
 */
const db = require('../database/db');

function listar() {
  return db.prepare('SELECT id, nome FROM torneios ORDER BY id').all();
}

function obterPorId(id) {
  return db.prepare('SELECT id, nome FROM torneios WHERE id = ?').get(id);
}

function criar(nome) {
  const result = db.prepare('INSERT INTO torneios (nome) VALUES (?)').run(nome);
  return result.lastInsertRowid;
}

module.exports = {
  listar,
  obterPorId,
  criar
};
