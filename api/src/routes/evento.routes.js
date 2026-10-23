const express = require("express");

const router = express.Router();

const { 
    cadastrar, 
    listar, 
    buscar, 
    atualizar, 
    excluir } = require("../controllers/evento.controller");

router.post("/cadastrar", cadastrar); //TESTADO
router.get("/listar", listar); //TESTADO
router.get("/buscar/:id", buscar); //TESTADO
router.put("/atualizar/:id", atualizar); //TESTADO
router.delete("/excluir/:id", excluir); //TESTADO

module.exports = router;
