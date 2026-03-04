/**
 * Controller: CRUD de partidas e registo de resultado.
 */
const partidaModel = require('../models/Partida');

function listar(req, res) {
  try {
    const torneioId = req.query.torneio_id != null ? parseInt(req.query.torneio_id, 10) : null;
    const partidas = partidaModel.listar(torneioId);
    res.json(partidas);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

function obterPorId(req, res) {
  try {
    const partida = partidaModel.obterPorId(req.params.id);
    if (!partida) return res.status(404).json({ erro: 'Partida não encontrada' });
    res.json(partida);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

function criar(req, res) {
  try {
    const { torneio_id, ordem, dupla1_id, dupla2_id } = req.body;
    if (!torneio_id || !dupla1_id || !dupla2_id) {
      return res.status(400).json({ erro: 'torneio_id, dupla1_id e dupla2_id são obrigatórios' });
    }
    if (Number(dupla1_id) === Number(dupla2_id)) {
      return res.status(400).json({ erro: 'As duplas devem ser diferentes' });
    }
    const ord = ordem != null ? parseInt(ordem, 10) : 1;
    const id = partidaModel.criar(Number(torneio_id), ord, Number(dupla1_id), Number(dupla2_id));
    const partida = partidaModel.obterPorId(id);
    res.status(201).json(partida);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

function atualizar(req, res) {
  try {
    const partida = partidaModel.obterPorId(req.params.id);
    if (!partida) return res.status(404).json({ erro: 'Partida não encontrada' });
    const { dupla1_id, dupla2_id, games_dupla1, games_dupla2 } = req.body;
    const vencedor_id = (games_dupla1 != null && games_dupla2 != null)
      ? (games_dupla1 > games_dupla2 ? partida.dupla1_id : partida.dupla2_id)
      : null;
    partidaModel.atualizar(req.params.id, {
      torneio_id: partida.torneio_id,
      ordem: partida.ordem,
      dupla1_id: dupla1_id ?? partida.dupla1_id,
      dupla2_id: dupla2_id ?? partida.dupla2_id,
      games_dupla1: games_dupla1 ?? partida.games_dupla1,
      games_dupla2: games_dupla2 ?? partida.games_dupla2,
      vencedor_id
    });
    res.json(partidaModel.obterPorId(req.params.id));
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

function apagar(req, res) {
  try {
    const partida = partidaModel.obterPorId(req.params.id);
    if (!partida) return res.status(404).json({ erro: 'Partida não encontrada' });
    partidaModel.apagar(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

/** POST /api/partidas/:id/resultado { games_dupla1, games_dupla2 } */
function registarResultado(req, res) {
  try {
    const partida = partidaModel.obterPorId(req.params.id);
    if (!partida) return res.status(404).json({ erro: 'Partida não encontrada' });
    const { games_dupla1, games_dupla2 } = req.body;
    const g1 = Number(games_dupla1);
    const g2 = Number(games_dupla2);
    if (isNaN(g1) || isNaN(g2) || g1 < 0 || g2 < 0) {
      return res.status(400).json({ erro: 'games_dupla1 e games_dupla2 devem ser números >= 0' });
    }
    if (g1 === g2) {
      return res.status(400).json({ erro: 'MD1 não permite empate; um vencedor é obrigatório' });
    }
    const atualizada = partidaModel.registarResultado(req.params.id, g1, g2);
    res.json(atualizada);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

module.exports = {
  listar,
  obterPorId,
  criar,
  atualizar,
  apagar,
  registarResultado
};
