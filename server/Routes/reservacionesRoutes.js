const express = require('express');
const router = express.Router();
const reservacionesController = require('../Controllers/reservacionesController');

router.post('/reservaciones', reservacionesController.realizarReservacion);
router.get('/reservaciones', reservacionesController.listarReservaciones);
router.delete('/reservaciones/:id', reservacionesController.eliminarReservacion);

module.exports = router;