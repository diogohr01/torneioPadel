/**
 * Model: Duplas - CRUD de duplas participantes.
 */
const db = require('../database/db');

function listar() {
  return db.prepare('SELECT id, nome FROM duplas ORDER BY nome').all();
}

function obterPorId(id) {
  return db.prepare('SELECT id, nome FROM duplas WHERE id = ?').get(id);
}

function criar(nome) {
  const result = db.prepare('INSERT INTO duplas (nome) VALUES (?)').run(nome);
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
