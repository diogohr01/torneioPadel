/**
 * Seed: torneio principal, duplas iniciais e partidas todos-contra-todos com ordem.
 * Idempotente: não duplica torneio, duplas nem partidas.
 */
const db = require('./db');

const NOME_TORNEIO = 'Torneio Principal';
const DUPLAS_INICIAIS = [
  'Carlos e Nico',
  'Diogo e Silveira',
  'Avelar e Sant'
];

function runSeed() {
  const torneioId = obterOuCriarTorneio();
  criarDuplasSeVazio(torneioId);
  criarPartidasTodosContraTodos(torneioId);
}

function obterOuCriarTorneio() {
  let row = db.prepare('SELECT id FROM torneios LIMIT 1').get();
  if (row) return row.id;
  const result = db.prepare('INSERT INTO torneios (nome) VALUES (?)').run(NOME_TORNEIO);
  return result.lastInsertRowid;
}

function criarDuplasSeVazio(torneioId) {
  const count = db.prepare('SELECT COUNT(*) as total FROM duplas WHERE torneio_id = ?').get(torneioId);
  if (count.total > 0) return;
  const insert = db.prepare('INSERT INTO duplas (torneio_id, nome) VALUES (?, ?)');
  const run = db.transaction(() => {
    for (const nome of DUPLAS_INICIAIS) {
      insert.run(torneioId, nome);
    }
  });
  run();
}

/** Cria todas as partidas do torneio (todos contra todos) com ordem 1, 2, 3... */
function criarPartidasTodosContraTodos(torneioId) {
  const count = db.prepare('SELECT COUNT(*) as total FROM partidas WHERE torneio_id = ?').get(torneioId);
  if (count.total > 0) return;
  const duplas = db.prepare('SELECT id FROM duplas WHERE torneio_id = ? ORDER BY id').all(torneioId);
  const insertPartida = db.prepare(
    'INSERT INTO partidas (torneio_id, ordem, dupla1_id, dupla2_id) VALUES (?, ?, ?, ?)'
  );
  let ordem = 1;
  const run = db.transaction(() => {
    for (let i = 0; i < duplas.length; i++) {
      for (let j = i + 1; j < duplas.length; j++) {
        insertPartida.run(torneioId, ordem++, duplas[i].id, duplas[j].id);
      }
    }
  });
  run();
}

module.exports = { runSeed };
