const connection = require('../Models/db');

exports.realizarReservacion = (req, res) => {
    const { habitacion_id, fecha, hora_inicio, hora_fin, persona_nombre } = req.body;

    const now = new Date();
    const currentDateTime = now.toISOString().replace('T', ' ').substring(0, 19);
    const requestedDateTime = `${fecha} ${hora_inicio}`;
    
    if (requestedDateTime <= currentDateTime) {
        return res.status(400).json({ error: 'No se pueden realizar reservaciones para fechas y horas pasadas.' });
    }

    const durationInHours = (new Date(`2000-01-01 ${hora_fin}`) - new Date(`2000-01-01 ${hora_inicio}`)) / (1000 * 60 * 60);
    
    if (hora_inicio >= hora_fin) {
        return res.status(400).json({ error: 'La hora de incio de reserva debe ser inferior a la hora de finalizacion del mismo dia' });
    }

    if (durationInHours < 1) {
        return res.status(400).json({ error: 'Las reservaciones deben tener una duración mínima de una hora.' });
    }

    const isValidStartTime = /^(\d{2}):00:00$/.test(hora_inicio);
    const isValidEndTime = /^(\d{2}):00:00$/.test(hora_fin);
    
    if (!isValidStartTime || !isValidEndTime) {
        return res.status(400).json({ error: 'Las horas de inicio y fin deben ser horas en punto exactas.' });
    }

    const adjustedHoraInicio = `${hora_inicio.split(':')[0]}:00:00`;
    const adjustedHoraFin = `${hora_fin.split(':')[0]}:00:00`;

    const availabilityCheckQuery = `
        SELECT id FROM reservaciones 
        WHERE habitacion_id=? AND fecha=? AND (
            (hora_inicio <= ? AND hora_fin > ?) OR 
            (hora_inicio < ? AND hora_fin >= ?) OR 
            (hora_inicio >= ? AND hora_fin <= ?)
        )
    `;
    connection.query(
        availabilityCheckQuery,
        [habitacion_id, fecha, adjustedHoraInicio, adjustedHoraInicio, adjustedHoraFin, adjustedHoraFin, adjustedHoraInicio, adjustedHoraFin],
        (err, results) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            if (results.length > 0) {
                res.status(400).json({ error: 'La habitación no está disponible en ese horario.' });
                return;
            }

            const createReservationQuery = `
                INSERT INTO reservaciones (habitacion_id, fecha, hora_inicio, hora_fin, persona_nombre)
                VALUES (?, ?, ?, ?, ?)
            `;
            connection.query(
                createReservationQuery,
                [habitacion_id, fecha, adjustedHoraInicio, adjustedHoraFin, persona_nombre],
                (err, result) => {
                    if (err) {
                        res.status(500).json({ error: "La habitación ingresada no existe en base de datos."});
                        return;
                    }
                    res.json({ id: result.insertId , message : "Habitacion reservada con exito"});
                }
            );
        }
    );
};

exports.listarReservaciones = (req, res) => {
    
    const { page = 1, pageSize = 10, habitacion_id, fecha } = req.query;
    const offset = (page - 1) * pageSize;

    let filterConditions = '';
    const filterParams = [];

    if (habitacion_id) {
        filterConditions += ' AND habitacion_id = ?';
        filterParams.push(habitacion_id);
    }

    if (fecha) {
        filterConditions += ' AND fecha = ?';
        filterParams.push(fecha);
    }

    
    const getReservationsQuery = `
        SELECT * FROM reservaciones 
        WHERE 1 ${filterConditions}
        ORDER BY fecha, hora_inicio
        LIMIT ? OFFSET ?
    `;

    connection.query(getReservationsQuery, [...filterParams, parseInt(pageSize), offset], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(results);
    });
};

exports.eliminarReservacion = (req, res) => {
    const reservacionId = req.params.id;

    const getReservationQuery = 'SELECT * FROM reservaciones WHERE id = ?';
    connection.query(getReservationQuery, [reservacionId], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        if (results.length === 0) {
            res.status(404).json({ error: 'Reservación no encontrada.' });
            return;
        }

        const deleteReservationQuery = 'DELETE FROM reservaciones WHERE id = ?';
        connection.query(deleteReservationQuery, [reservacionId], (err) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            res.json({ message: 'Reservación eliminada correctamente.' });
        });
    });
};