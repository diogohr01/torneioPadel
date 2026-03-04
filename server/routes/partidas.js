/**
 * Rotas API: partidas (CRUD) e registo de resultado.
 */
const express = require('express');
const router = express.Router();
const controller = require('../controllers/partidasController');

router.get('/', controller.listar);
router.get('/:id', controller.obterPorId);
router.post('/', controller.criar);
router.put('/:id', controller.atualizar);
router.delete('/:id', controller.apagar);
router.post('/:id/resultado', controller.registarResultado);

module.exports = router;
