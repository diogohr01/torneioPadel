/**
 * Rotas API: classificação ordenada com desempate.
 */
const express = require('express');
const router = express.Router();
const controller = require('../controllers/classificacaoController');

router.get('/', controller.listar);

module.exports = router;
