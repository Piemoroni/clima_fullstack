const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario.controller');

router.post('/cadastrar', usuarioController.cadastrar); //TESTADO
router.get('/listar', usuarioController.listar); //TESTADO
router.get('/buscar/:id', usuarioController.buscar); //TESTADO
router.put('/atualizar/:id', usuarioController.atualizar); //TESTADO
router.delete('/excluir/:id', usuarioController.excluir); //TESTADO
router.post('/login', usuarioController.login);

module.exports = router;