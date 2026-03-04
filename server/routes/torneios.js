/**
 * Rotas API: torneios, próximo jogo, gerar partidas.
 */
const express = require('express');
const router = express.Router();
const controller = require('../controllers/torneiosController');

router.get('/', controller.listar);
router.post('/', controller.criar);
router.get('/:id/proximo-jogo', controller.proximoJogo);
router.post('/:id/gerar-partidas', controller.gerarPartidas);
router.post('/:id/adicionar-rodadas', controller.adicionarRodadas);
router.post('/:id/finalizar', controller.finalizar);
router.delete('/:id', controller.apagar);
router.get('/:id', controller.obterPorId);

module.exports = router;
