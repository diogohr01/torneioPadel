/**
 * Rotas API: partidas (CRUD), comentários por partida, registo de resultado.
 */
const express = require('express');
const router = express.Router();
const controller = require('../controllers/partidasController');
const comentariosController = require('../controllers/comentariosController');

router.get('/', controller.listar);
router.get('/:id/comentarios', comentariosController.listar);
router.post('/:id/comentarios', comentariosController.criar);
router.get('/:id', controller.obterPorId);
router.post('/', controller.criar);
router.put('/:id', controller.atualizar);
router.delete('/:id', controller.apagar);
router.post('/:id/resultado', controller.registarResultado);

module.exports = router;
