const express = require('express');
const router = express.Router();
const habitacionesController = require('../Controllers/habitacionesController');

router.get('/habitaciones', habitacionesController.listarHabitaciones);
router.post('/habitaciones', habitacionesController.crearHabitacion);
router.put('/habitaciones/:id', habitacionesController.actualizarHabitacion);
router.delete('/habitaciones/:id', habitacionesController.eliminarHabitacion);

module.exports = router;