/**
 * Model: Partidas - CRUD e registo de resultado, por torneio e ordem.
 */
const db = require('../database/db');

function listar(torneioId) {
  const sql = `
    SELECT p.id, p.torneio_id, p.ordem, p.dupla1_id, p.dupla2_id, p.games_dupla1, p.games_dupla2, p.vencedor_id,
           d1.nome AS dupla1_nome, d2.nome AS dupla2_nome
    FROM partidas p
    JOIN duplas d1 ON p.dupla1_id = d1.id
    JOIN duplas d2 ON p.dupla2_id = d2.id
  `;
  if (torneioId != null) {
    const stmt = db.prepare(sql + ' WHERE p.torneio_id = ? ORDER BY p.ordem, p.id');
    return stmt.all(torneioId);
  }
  return db.prepare(sql + ' ORDER BY p.torneio_id, p.ordem, p.id').all();
}

function obterPorId(id) {
  return db.prepare(`
    SELECT p.id, p.torneio_id, p.ordem, p.dupla1_id, p.dupla2_id, p.games_dupla1, p.games_dupla2, p.vencedor_id,
           d1.nome AS dupla1_nome, d2.nome AS dupla2_nome
    FROM partidas p
    JOIN duplas d1 ON p.dupla1_id = d1.id
    JOIN duplas d2 ON p.dupla2_id = d2.id
    WHERE p.id = ?
  `).get(id);
}

function criar(torneioId, ordem, dupla1_id, dupla2_id) {
  const result = db.prepare(
    'INSERT INTO partidas (torneio_id, ordem, dupla1_id, dupla2_id) VALUES (?, ?, ?, ?)'
  ).run(torneioId, ordem, dupla1_id, dupla2_id);
  return result.lastInsertRowid;
}

function atualizar(id, dados) {
  const { torneio_id, ordem, dupla1_id, dupla2_id, games_dupla1, games_dupla2, vencedor_id } = dados;
  return db.prepare(`
    UPDATE partidas SET torneio_id = ?, ordem = ?, dupla1_id = ?, dupla2_id = ?, games_dupla1 = ?, games_dupla2 = ?, vencedor_id = ?
    WHERE id = ?
  `).run(
    torneio_id ?? null, ordem ?? null, dupla1_id ?? null, dupla2_id ?? null,
    games_dupla1 ?? null, games_dupla2 ?? null, vencedor_id ?? null, id
  );
}

function apagar(id) {
  return db.prepare('DELETE FROM partidas WHERE id = ?').run(id);
}

/**
 * Regista o resultado de uma partida (games de cada dupla) e define o vencedor.
 */
function registarResultado(id, games_dupla1, games_dupla2) {
  const partida = obterPorId(id);
  if (!partida) return null;
  const vencedor_id = games_dupla1 > games_dupla2
    ? partida.dupla1_id
    : partida.dupla2_id;
  atualizar(id, {
    torneio_id: partida.torneio_id,
    ordem: partida.ordem,
    dupla1_id: partida.dupla1_id,
    dupla2_id: partida.dupla2_id,
    games_dupla1,
    games_dupla2,
    vencedor_id
  });
  return obterPorId(id);
}

/** Partidas com resultado (por torneio ou todas) */
function listarComResultado(torneioId) {
  if (torneioId != null) {
    return db.prepare('SELECT * FROM partidas WHERE vencedor_id IS NOT NULL AND torneio_id = ?').all(torneioId);
  }
  return db.prepare('SELECT * FROM partidas WHERE vencedor_id IS NOT NULL').all();
}

/** Primeira partida do torneio sem resultado (próximo jogo) */
function obterProximoJogo(torneioId) {
  return db.prepare(`
    SELECT p.id, p.torneio_id, p.ordem, p.dupla1_id, p.dupla2_id, p.games_dupla1, p.games_dupla2, p.vencedor_id,
           d1.nome AS dupla1_nome, d2.nome AS dupla2_nome
    FROM partidas p
    JOIN duplas d1 ON p.dupla1_id = d1.id
    JOIN duplas d2 ON p.dupla2_id = d2.id
    WHERE p.torneio_id = ? AND p.vencedor_id IS NULL
    ORDER BY p.ordem
    LIMIT 1
  `).get(torneioId);
}

module.exports = {
  listar,
  obterPorId,
  criar,
  atualizar,
  apagar,
  registarResultado,
  listarComResultado,
  obterProximoJogo
};
