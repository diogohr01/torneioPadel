/**
 * Conexão SQLite e inicialização do schema.
 * Cria/abre torneio.db e executa schema.sql se as tabelas não existirem.
 */
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'torneio.db');
const db = new Database(dbPath);

// Executar schema
const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');
db.exec(schema);

// Migração: bases antigas sem torneio_id / ordem
const colsDuplas = db.prepare("PRAGMA table_info(duplas)").all();
const hasTorneioIdDuplas = colsDuplas.some(c => c.name === 'torneio_id');
if (!hasTorneioIdDuplas) {
  db.exec("INSERT OR IGNORE INTO torneios (id, nome) VALUES (1, 'Torneio Principal')");
  db.exec("ALTER TABLE duplas ADD COLUMN torneio_id INTEGER DEFAULT 1");
  db.exec("ALTER TABLE partidas ADD COLUMN torneio_id INTEGER DEFAULT 1");
  db.exec("ALTER TABLE partidas ADD COLUMN ordem INTEGER DEFAULT 1");
  db.exec("UPDATE partidas SET ordem = id");
}
// Corrigir partidas que ficaram todas com ordem=1 (migração antiga)
try {
  const dup = db.prepare(
    "SELECT 1 FROM partidas GROUP BY torneio_id, ordem HAVING COUNT(*) > 1 LIMIT 1"
  ).get();
  if (dup) db.exec("UPDATE partidas SET ordem = id");
} catch (e) { /* coluna ordem pode não existir */ }
// Índices que dependem de torneio_id / ordem (após migração)
try {
  db.exec("CREATE INDEX IF NOT EXISTS idx_duplas_torneio ON duplas(torneio_id)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_partidas_torneio ON partidas(torneio_id)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_partidas_torneio_ordem ON partidas(torneio_id, ordem)");
} catch (e) { /* já existem */ }

// Migração: tabela comentarios (bases antigas)
try {
  const comentariosInfo = db.prepare("PRAGMA table_info(comentarios)").all();
  if (!comentariosInfo || comentariosInfo.length === 0) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS comentarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        partida_id INTEGER NOT NULL,
        autor_nome TEXT,
        texto TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (partida_id) REFERENCES partidas(id)
      );
      CREATE INDEX IF NOT EXISTS idx_comentarios_partida ON comentarios(partida_id);
    `);
  }
} catch (e) { /* ignorar */ }

// Migração: torneios finalizado / finalizado_at (bases antigas)
const colsTorneios = db.prepare("PRAGMA table_info(torneios)").all();
const hasFinalizado = colsTorneios.some(c => c.name === 'finalizado');
if (!hasFinalizado) {
  db.exec("ALTER TABLE torneios ADD COLUMN finalizado INTEGER DEFAULT 0");
  db.exec("ALTER TABLE torneios ADD COLUMN finalizado_at TEXT");
}

module.exports = db;
