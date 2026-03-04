/**
 * Model: Torneios.
 */
const db = require('../database/db');

function listar() {
  return db.prepare('SELECT id, nome, finalizado, finalizado_at FROM torneios ORDER BY id').all();
}

function obterPorId(id) {
  return db.prepare('SELECT id, nome, finalizado, finalizado_at FROM torneios WHERE id = ?').get(id);
}

function finalizar(id) {
  const tid = parseInt(id, 10);
  if (!tid) return false;
  const result = db.prepare("UPDATE torneios SET finalizado = 1, finalizado_at = datetime('now') WHERE id = ?").run(tid);
  return result.changes > 0;
}

function criar(nome) {
  const result = db.prepare('INSERT INTO torneios (nome) VALUES (?)').run(nome);
  return result.lastInsertRowid;
}

/** Apaga torneio e os dados associados (partidas e duplas desse torneio). */
function apagar(id) {
  const tid = parseInt(id, 10);
  if (!tid) return false;
  db.prepare('DELETE FROM partidas WHERE torneio_id = ?').run(tid);
  db.prepare('DELETE FROM duplas WHERE torneio_id = ?').run(tid);
  const result = db.prepare('DELETE FROM torneios WHERE id = ?').run(tid);
  return result.changes > 0;
}

module.exports = {
  listar,
  obterPorId,
  criar,
  finalizar,
  apagar
};
