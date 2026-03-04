/**
 * Model: Partidas - CRUD e registo de resultado.
 */
const db = require('../database/db');

function listar() {
  const partidas = db.prepare(`
    SELECT p.id, p.dupla1_id, p.dupla2_id, p.games_dupla1, p.games_dupla2, p.vencedor_id,
           d1.nome AS dupla1_nome, d2.nome AS dupla2_nome
    FROM partidas p
    JOIN duplas d1 ON p.dupla1_id = d1.id
    JOIN duplas d2 ON p.dupla2_id = d2.id
    ORDER BY p.id
  `).all();
  return partidas;
}

function obterPorId(id) {
  const partida = db.prepare(`
    SELECT p.id, p.dupla1_id, p.dupla2_id, p.games_dupla1, p.games_dupla2, p.vencedor_id,
           d1.nome AS dupla1_nome, d2.nome AS dupla2_nome
    FROM partidas p
    JOIN duplas d1 ON p.dupla1_id = d1.id
    JOIN duplas d2 ON p.dupla2_id = d2.id
    WHERE p.id = ?
  `).get(id);
  return partida;
}

function criar(dupla1_id, dupla2_id) {
  const result = db.prepare(
    'INSERT INTO partidas (dupla1_id, dupla2_id) VALUES (?, ?)'
  ).run(dupla1_id, dupla2_id);
  return result.lastInsertRowid;
}

function atualizar(id, dados) {
  const { dupla1_id, dupla2_id, games_dupla1, games_dupla2, vencedor_id } = dados;
  return db.prepare(`
    UPDATE partidas SET dupla1_id = ?, dupla2_id = ?, games_dupla1 = ?, games_dupla2 = ?, vencedor_id = ?
    WHERE id = ?
  `).run(dupla1_id, dupla2_id, games_dupla1 ?? null, games_dupla2 ?? null, vencedor_id ?? null, id);
}

function apagar(id) {
  return db.prepare('DELETE FROM partidas WHERE id = ?').run(id);
}

/**
 * Regista o resultado de uma partida (games de cada dupla) e define o vencedor.
 * MD1: não há empate; vencedor = quem fez mais games.
 */
function registarResultado(id, games_dupla1, games_dupla2) {
  const partida = obterPorId(id);
  if (!partida) return null;
  const vencedor_id = games_dupla1 > games_dupla2
    ? partida.dupla1_id
    : partida.dupla2_id;
  atualizar(id, {
    dupla1_id: partida.dupla1_id,
    dupla2_id: partida.dupla2_id,
    games_dupla1,
    games_dupla2,
    vencedor_id
  });
  return obterPorId(id);
}

/** Partidas que já têm resultado (vencedor_id preenchido) */
function listarComResultado() {
  return db.prepare(`
    SELECT * FROM partidas WHERE vencedor_id IS NOT NULL
  `).all();
}

module.exports = {
  listar,
  obterPorId,
  criar,
  atualizar,
  apagar,
  registarResultado,
  listarComResultado
};
