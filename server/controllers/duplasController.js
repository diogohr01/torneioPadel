/**
 * Controller: CRUD de duplas.
 */
const duplaModel = require('../models/Dupla');

function listar(req, res) {
  try {
    const torneioId = req.query.torneio_id != null ? parseInt(req.query.torneio_id, 10) : null;
    const duplas = duplaModel.listar(torneioId);
    res.json(duplas);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

function obterPorId(req, res) {
  try {
    const dupla = duplaModel.obterPorId(req.params.id);
    if (!dupla) return res.status(404).json({ erro: 'Dupla não encontrada' });
    res.json(dupla);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

function criar(req, res) {
  try {
    const { nome, torneio_id } = req.body;
    if (!nome || !nome.trim()) {
      return res.status(400).json({ erro: 'Nome da dupla é obrigatório' });
    }
    const torneioId = torneio_id != null ? parseInt(torneio_id, 10) : null;
    if (torneioId == null || isNaN(torneioId)) {
      return res.status(400).json({ erro: 'torneio_id é obrigatório' });
    }
    const id = duplaModel.criar(nome.trim(), torneioId);
    const dupla = duplaModel.obterPorId(id);
    res.status(201).json(dupla);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

function atualizar(req, res) {
  try {
    const { nome } = req.body;
    if (!nome || !nome.trim()) {
      return res.status(400).json({ erro: 'Nome da dupla é obrigatório' });
    }
    const dupla = duplaModel.obterPorId(req.params.id);
    if (!dupla) return res.status(404).json({ erro: 'Dupla não encontrada' });
    duplaModel.atualizar(req.params.id, nome.trim());
    res.json({ id: parseInt(req.params.id), nome: nome.trim() });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

function apagar(req, res) {
  try {
    const dupla = duplaModel.obterPorId(req.params.id);
    if (!dupla) return res.status(404).json({ erro: 'Dupla não encontrada' });
    duplaModel.apagar(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

module.exports = {
  listar,
  obterPorId,
  criar,
  atualizar,
  apagar
};
