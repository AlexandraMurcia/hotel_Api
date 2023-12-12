const connection = require('../Models/db');

exports.listarHabitaciones = (req, res) => {
    
    const { page = 1, pageSize = 10, tipo, capacidad } = req.query;
    const offset = (page - 1) * pageSize;

    let filterConditions = '';
    const filterParams = [];

    if (tipo) {
        filterConditions += ' AND tipo = ?';
        filterParams.push(tipo);
    }

    if (capacidad) {
        filterConditions += ' AND capacidad = ?';
        filterParams.push(capacidad);
    }

    const getRoomsQuery = `
        SELECT * FROM habitaciones 
        WHERE 1 ${filterConditions}
        ORDER BY numero
        LIMIT ? OFFSET ?
    `;

    connection.query(getRoomsQuery, [...filterParams, parseInt(pageSize), offset], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(results);
    });
};

exports.crearHabitacion = (req, res) => {
    const { numero, tipo, capacidad } = req.body;
    const sql = 'INSERT INTO habitaciones (numero, tipo, capacidad) VALUES (?, ?, ?)';
    connection.query(sql, [numero, tipo, capacidad], (err, result) => {
        if (err) {
            res.status(500).json({ error: `La habitacion ${numero} ya fue creada anteriormente, intente con otro numero` });
            return;
        }
        res.json({ id: result.insertId , message: "Habitacion creada con exito"});
    });
};

exports.actualizarHabitacion = (req, res) => {
    const { numero, tipo, capacidad } = req.body;
    const { id } = req.params;
    const sql = 'UPDATE habitaciones SET numero=?, tipo=?, capacidad=? WHERE id=?';
    connection.query(sql, [numero, tipo, capacidad, id], err => {
        if (err) {
            res.status(500).json({ error:  `El numero ${numero} ya existe en base de datos, prueba actualizar con otro numero`});
            return;
        }
        res.json({ message: 'Habitación actualizada correctamente' });
    });
};

exports.eliminarHabitacion = (req, res) => {
    const {id} = req.params;

    const getRoomsQuery = `SELECT * FROM habitaciones WHERE id = ${id}`;
    connection.query(getRoomsQuery, (err, results) => {
        if (err) {
            res.status(500).json({error : err.message});
            return;
        }

        if (results.length === 0) {
            res.status(404).json({ error: 'Habitacion no encontrada.'});
            return;
        }
        const sql = 'DELETE FROM habitaciones WHERE id=?';
        connection.query(sql, [id], err => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
    
            res.json({ message: 'Habitación eliminada correctamente' });
        });
    })
};