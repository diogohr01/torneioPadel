-- Tabela de torneios (permite múltiplos torneios no futuro)
CREATE TABLE IF NOT EXISTS torneios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  finalizado INTEGER DEFAULT 0,
  finalizado_at TEXT
);

-- Tabela de duplas participantes (por torneio)
CREATE TABLE IF NOT EXISTS duplas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  torneio_id INTEGER NOT NULL,
  nome TEXT NOT NULL,
  FOREIGN KEY (torneio_id) REFERENCES torneios(id)
);

-- Tabela de partidas (todos contra todos, por torneio, com ordem)
CREATE TABLE IF NOT EXISTS partidas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  torneio_id INTEGER NOT NULL,
  ordem INTEGER NOT NULL,
  dupla1_id INTEGER NOT NULL,
  dupla2_id INTEGER NOT NULL,
  games_dupla1 INTEGER,
  games_dupla2 INTEGER,
  vencedor_id INTEGER,
  FOREIGN KEY (torneio_id) REFERENCES torneios(id),
  FOREIGN KEY (dupla1_id) REFERENCES duplas(id),
  FOREIGN KEY (dupla2_id) REFERENCES duplas(id),
  FOREIGN KEY (vencedor_id) REFERENCES duplas(id),
  CHECK (dupla1_id != dupla2_id)
);

-- Índices (torneio_id criado após migração em db.js)
CREATE INDEX IF NOT EXISTS idx_partidas_dupla1 ON partidas(dupla1_id);
CREATE INDEX IF NOT EXISTS idx_partidas_dupla2 ON partidas(dupla2_id);
CREATE INDEX IF NOT EXISTS idx_partidas_vencedor ON partidas(vencedor_id);

-- Comentários por partida (anonónimos ou com nome)
CREATE TABLE IF NOT EXISTS comentarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  partida_id INTEGER NOT NULL,
  autor_nome TEXT,
  texto TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (partida_id) REFERENCES partidas(id)
);
CREATE INDEX IF NOT EXISTS idx_comentarios_partida ON comentarios(partida_id);
