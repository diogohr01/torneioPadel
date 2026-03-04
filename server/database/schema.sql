-- Tabela de duplas participantes no torneio
CREATE TABLE IF NOT EXISTS duplas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL
);

-- Tabela de partidas (todos contra todos)
CREATE TABLE IF NOT EXISTS partidas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dupla1_id INTEGER NOT NULL,
  dupla2_id INTEGER NOT NULL,
  games_dupla1 INTEGER,
  games_dupla2 INTEGER,
  vencedor_id INTEGER,
  FOREIGN KEY (dupla1_id) REFERENCES duplas(id),
  FOREIGN KEY (dupla2_id) REFERENCES duplas(id),
  FOREIGN KEY (vencedor_id) REFERENCES duplas(id),
  CHECK (dupla1_id != dupla2_id)
);

-- Índices para consultas frequentes
CREATE INDEX IF NOT EXISTS idx_partidas_dupla1 ON partidas(dupla1_id);
CREATE INDEX IF NOT EXISTS idx_partidas_dupla2 ON partidas(dupla2_id);
CREATE INDEX IF NOT EXISTS idx_partidas_vencedor ON partidas(vencedor_id);
