/**
 * Controller: CRUD de duplas.
 */
const duplaModel = require('../models/Dupla');

function listar(req, res) {
  try {
    const duplas = duplaModel.listar();
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
    const { nome } = req.body;
    if (!nome || !nome.trim()) {
      return res.status(400).json({ erro: 'Nome da dupla é obrigatório' });
    }
    const id = duplaModel.criar(nome.trim());
    res.status(201).json({ id, nome: nome.trim() });
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
