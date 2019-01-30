// Requires
var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Medico = require('../models/medico');
var Hospital = require('../models/hospital');
var Usuario = require('../models/usuario');

//Rutas
app.get('/', mdAutenticacion.verificaToken, (req, res, next) => {

    Medico.find({}, 'nombre img usuario hospital')
        .exec(
            (err, medicos) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error de medico',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    medicos: medicos
                });

            });

});

module.exports = app;