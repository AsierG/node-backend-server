// Requires
var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Hospital = require('../models/hospital');
var Usuario = require('../models/usuario');

//Rutas
app.get('/', (req, res, next) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec(
            (err, hospitales) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hospitales',
                        errors: err
                    });
                }
                Hospital.count({}, (err, total) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error calculando el count de hospitales',
                            errors: err
                        });
                    }
                    res.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total: total
                    });
                });

            });
});

// Actualizar un hospital
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    console.log('id ' + id);
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Hospital no encontrado con id: ' + id + ' no existe',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el hospital',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });

        });

    });

});


// Crear un nuevo hospital
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });

    });

});

// Borrar hospital por el id
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    console.log(`Id a borrar ${id}`);

    Hospital.findOneAndDelete(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }
        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con ese id',
                errors: { message: `No existe un hospital con el id ${id}` }
            });
        }
        res.status(200).json({
            ok: true,
            usuario: hospitalBorrado
        });
    });

});

module.exports = app;