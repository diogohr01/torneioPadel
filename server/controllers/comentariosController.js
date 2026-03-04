/**
 * Controller: Comentários por partida.
 */
const comentarioModel = require('../models/Comentario');
const partidaModel = require('../models/Partida');

const MAX_TEXTO = 500;

function listar(req, res) {
  try {
    const partidaId = req.params.id;
    const partida = partidaModel.obterPorId(partidaId);
    if (!partida) return res.status(404).json({ erro: 'Partida não encontrada' });
    const comentarios = comentarioModel.listarPorPartida(partidaId);
    res.json(comentarios);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

function criar(req, res) {
  try {
    const partidaId = req.params.id;
    const partida = partidaModel.obterPorId(partidaId);
    if (!partida) return res.status(404).json({ erro: 'Partida não encontrada' });

    let { autor_nome, texto } = req.body || {};
    texto = texto != null ? String(texto).trim() : '';
    if (texto === '') return res.status(400).json({ erro: 'O texto do comentário é obrigatório' });
    if (texto.length > MAX_TEXTO) return res.status(400).json({ erro: 'O comentário não pode exceder ' + MAX_TEXTO + ' caracteres' });

    autor_nome = autor_nome != null ? String(autor_nome).trim() : null;

    const comentario = comentarioModel.criar(partidaId, { autor_nome, texto });
    res.status(201).json(comentario);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

module.exports = {
  listar,
  criar
};
