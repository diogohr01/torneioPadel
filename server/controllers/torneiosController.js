/**
 * Controller: Torneios e próximo jogo / gerar partidas.
 */
const db = require('../database/db');
const torneioModel = require('../models/Torneio');
const duplaModel = require('../models/Dupla');
const partidaModel = require('../models/Partida');

function listar(req, res) {
  try {
    const torneios = torneioModel.listar();
    res.json(torneios);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

function obterPorId(req, res) {
  try {
    const torneio = torneioModel.obterPorId(req.params.id);
    if (!torneio) return res.status(404).json({ erro: 'Torneio não encontrado' });
    res.json(torneio);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

function criar(req, res) {
  try {
    const { nome } = req.body;
    if (!nome || !nome.trim()) {
      return res.status(400).json({ erro: 'Nome do torneio é obrigatório' });
    }
    const id = torneioModel.criar(nome.trim());
    const torneio = torneioModel.obterPorId(id);
    res.status(201).json(torneio);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

/** GET /api/torneios/:id/proximo-jogo */
function proximoJogo(req, res) {
  try {
    const torneioId = parseInt(req.params.id, 10);
    const partida = partidaModel.obterProximoJogo(torneioId);
    if (!partida) return res.status(404).json({ erro: 'Nenhum jogo pendente' });
    res.json(partida);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

/** POST /api/torneios/:id/gerar-partidas - todos contra todos, N rodadas */
function gerarPartidas(req, res) {
  try {
    const torneioId = parseInt(req.params.id, 10);
    const torneio = torneioModel.obterPorId(torneioId);
    if (!torneio) return res.status(404).json({ erro: 'Torneio não encontrado' });
    const existentes = partidaModel.listar(torneioId);
    if (existentes.length > 0) {
      return res.status(400).json({ erro: 'Este torneio já tem partidas. Apague-as primeiro para regenerar.' });
    }
    const duplas = duplaModel.listar(torneioId);
    if (duplas.length < 2) {
      return res.status(400).json({ erro: 'É preciso pelo menos 2 duplas para gerar partidas.' });
    }
    let rodadas = parseInt(req.body?.rodadas, 10) || 1;
    rodadas = Math.max(1, Math.min(10, rodadas));
    let ordem = 1;
    db.transaction(() => {
      for (let r = 0; r < rodadas; r++) {
        const trocar = r >= 1;
        for (let i = 0; i < duplas.length; i++) {
          for (let j = i + 1; j < duplas.length; j++) {
            const d1 = trocar ? duplas[j].id : duplas[i].id;
            const d2 = trocar ? duplas[i].id : duplas[j].id;
            partidaModel.criar(torneioId, ordem++, d1, d2);
          }
        }
      }
    })();
    const partidas = partidaModel.listar(torneioId);
    res.status(201).json({ mensagem: 'Partidas geradas', total: partidas.length, partidas });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

/** POST /api/torneios/:id/adicionar-rodadas - adiciona N rodadas sem apagar partidas */
function adicionarRodadas(req, res) {
  try {
    const torneioId = parseInt(req.params.id, 10);
    const torneio = torneioModel.obterPorId(torneioId);
    if (!torneio) return res.status(404).json({ erro: 'Torneio não encontrado' });
    const duplas = duplaModel.listar(torneioId);
    if (duplas.length < 2) {
      return res.status(400).json({ erro: 'É preciso pelo menos 2 duplas.' });
    }
    let rodadas = parseInt(req.body?.rodadas, 10) || 1;
    rodadas = Math.max(1, Math.min(10, rodadas));
    const maxRow = db.prepare('SELECT COALESCE(MAX(ordem), 0) AS maxOrdem FROM partidas WHERE torneio_id = ?').get(torneioId);
    let ordem = (maxRow && maxRow.maxOrdem != null ? maxRow.maxOrdem : 0) + 1;
    db.transaction(() => {
      for (let r = 0; r < rodadas; r++) {
        const trocar = r >= 1;
        for (let i = 0; i < duplas.length; i++) {
          for (let j = i + 1; j < duplas.length; j++) {
            const d1 = trocar ? duplas[j].id : duplas[i].id;
            const d2 = trocar ? duplas[i].id : duplas[j].id;
            partidaModel.criar(torneioId, ordem++, d1, d2);
          }
        }
      }
    })();
    const partidas = partidaModel.listar(torneioId);
    res.status(201).json({ mensagem: 'Rodada(s) adicionada(s)', total: partidas.length, partidas });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

module.exports = {
  listar,
  obterPorId,
  criar,
  proximoJogo,
  gerarPartidas,
  adicionarRodadas
};
