const express = require('express');
const Mensaje = require('../models/Mensaje');
const Usuario = require('../models/Usuario');
const { verificarToken } = require('../middleware/auth');
const router = express.Router();

// Lista de usuarios disponibles para chatear (todos menos yo)
router.get('/contactos', verificarToken, async (req, res) => {
  try {
    const usuarios = await Usuario.find({ _id: { $ne: req.usuario.id }, estado: 'activo' })
      .select('nombre email rol')
      .sort({ nombre: 1 });
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ msg: 'Error', error: err.message });
  }
});

// Enviar mensaje
router.post('/', verificarToken, async (req, res) => {
  try {
    const { para, texto } = req.body;
    const mensaje = new Mensaje({
      de: req.usuario.id,
      para,
      texto,
      empresa_id: req.usuario.empresa
    });
    await mensaje.save();
    res.status(201).json(mensaje);
  } catch (err) {
    res.status(500).json({ msg: 'Error enviando mensaje', error: err.message });
  }
});

// Ver conversación entre dos usuarios
router.get('/:usuario_id', verificarToken, async (req, res) => {
  try {
    const mensajes = await Mensaje.find({
      $or: [
        { de: req.usuario.id, para: req.params.usuario_id },
        { de: req.params.usuario_id, para: req.usuario.id }
      ]
    }).sort({ createdAt: 1 }).limit(100);

    await Mensaje.updateMany(
      { de: req.params.usuario_id, para: req.usuario.id, leido: false },
      { leido: true }
    );

    res.json(mensajes);
  } catch (err) {
    res.status(500).json({ msg: 'Error', error: err.message });
  }
});

// No leídos de un contacto específico
router.get('/no-leidos/:de_id', verificarToken, async (req, res) => {
  try {
    const count = await Mensaje.countDocuments({
      de: req.params.de_id,
      para: req.usuario.id,
      leido: false
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ msg: 'Error', error: err.message });
  }
});

// Mensajes no leídos
router.get('/no-leidos/count', verificarToken, async (req, res) => {
  try {
    const count = await Mensaje.countDocuments({ para: req.usuario.id, leido: false });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ msg: 'Error', error: err.message });
  }
});

// No leídos de un contacto específico
router.get('/no-leidos/:de_id', verificarToken, async (req, res) => {
  try {
    const count = await Mensaje.countDocuments({
      de: req.params.de_id,
      para: req.usuario.id,
      leido: false
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ msg: 'Error', error: err.message });
  }
});

module.exports = router;