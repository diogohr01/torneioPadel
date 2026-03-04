/**
 * Seed das duplas iniciais e partidas todos-contra-todos.
 * Idempotente: só insere se as tabelas estiverem vazias.
 */
const db = require('./db');

const DUPLAS_INICIAIS = [
  'Carlos e Nico',
  'Diogo e Silveira',
  'Avelar e Sant'
];

function runSeed() {
  const countDuplas = db.prepare('SELECT COUNT(*) as total FROM duplas').get();
  if (countDuplas.total > 0) {
    criarPartidasTodosContraTodos();
    return;
  }
  const insert = db.prepare('INSERT INTO duplas (nome) VALUES (?)');
  const insertMany = db.transaction((nomes) => {
    for (const nome of nomes) {
      insert.run(nome);
    }
  });
  insertMany(DUPLAS_INICIAIS);
  criarPartidasTodosContraTodos();
}

/** Cria todas as partidas do grupo único (todos contra todos) se ainda não existirem. */
function criarPartidasTodosContraTodos() {
  const countPartidas = db.prepare('SELECT COUNT(*) as total FROM partidas').get();
  if (countPartidas.total > 0) return;
  const duplas = db.prepare('SELECT id FROM duplas ORDER BY id').all();
  const insertPartida = db.prepare(
    'INSERT INTO partidas (dupla1_id, dupla2_id) VALUES (?, ?)'
  );
  const run = db.transaction(() => {
    for (let i = 0; i < duplas.length; i++) {
      for (let j = i + 1; j < duplas.length; j++) {
        insertPartida.run(duplas[i].id, duplas[j].id);
      }
    }
  });
  run();
}

module.exports = { runSeed };
