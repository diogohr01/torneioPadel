/**
 * Rotas API: duplas (CRUD).
 */
const express = require('express');
const router = express.Router();
const controller = require('../controllers/duplasController');

router.get('/', controller.listar);
router.get('/:id', controller.obterPorId);
router.post('/', controller.criar);
router.put('/:id', controller.atualizar);
router.delete('/:id', controller.apagar);

module.exports = router;
