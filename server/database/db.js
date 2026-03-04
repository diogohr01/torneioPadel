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

module.exports = db;
