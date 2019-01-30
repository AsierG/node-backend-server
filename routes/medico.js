// Requires
var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

//Rutas
app.get('/', (req, res, next) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (err, medicos) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando medicos',
                        errors: err
                    });
                }
                Medico.count({}, (err, total) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error calculando el count de medicos',
                            errors: err
                        });
                    }
                    res.status(200).json({
                        ok: true,
                        medicos: medicos,
                        total: total
                    });
                });
            });
});

// Actualizar un medico
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    console.log('id ' + id);
    var body = req.body;

    Medico.findById(id, (err, medico) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }
        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Medico no encontrado con id: ' + id + ' no existe',
                errors: { message: 'No existe un medico con ese ID' }
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el medico',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });

        });

    });

});


// Crear un nuevo medico
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            medico: medicoGuardado
        });

    });

});

// Borrar medico por el id
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    console.log(`Id a borrar ${id}`);

    Medico.findOneAndDelete(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            });
        }
        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un medico con ese id',
                errors: { message: `No existe un medico con el id ${id}` }
            });
        }
        res.status(200).json({
            ok: true,
            usuario: medicoBorrado
        });
    });

});

module.exports = app;