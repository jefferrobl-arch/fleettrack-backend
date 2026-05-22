const express = require('express');
const Usuario = require('../models/Usuario');
const { verificarToken, soloAdmin } = require('../middleware/auth');
const router = express.Router();

// Usuarios conectados (activos en últimas 24h)
router.get('/usuarios-conectados', verificarToken, soloAdmin, async (req, res) => {
  try {
    const hace24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const usuarios = await Usuario.find({ updatedAt: { $gte: hace24h } })
      .select('nombre email rol estado updatedAt')
      .sort({ updatedAt: -1 });
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ msg: 'Error', error: err.message });
  }
});

// Todos los usuarios
router.get('/usuarios', verificarToken, soloAdmin, async (req, res) => {
  try {
    const usuarios = await Usuario.find()
      .select('nombre email rol estado createdAt')
      .sort({ createdAt: -1 });
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ msg: 'Error', error: err.message });
  }
});

// Cambiar rol de usuario
router.put('/usuarios/:id/rol', verificarToken, soloAdmin, async (req, res) => {
  try {
    const { rol } = req.body;
    const usuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      { rol },
      { new: true }
    ).select('nombre email rol');
    res.json({ msg: 'Rol actualizado', usuario });
  } catch (err) {
    res.status(500).json({ msg: 'Error', error: err.message });
  }
});

// Bloquear/desbloquear usuario
router.put('/usuarios/:id/estado', verificarToken, soloAdmin, async (req, res) => {
  try {
    const { estado } = req.body;
    const usuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      { estado, intentos_fallidos: 0 },
      { new: true }
    ).select('nombre email estado');
    res.json({ msg: 'Estado actualizado', usuario });
  } catch (err) {
    res.status(500).json({ msg: 'Error', error: err.message });
  }
});

// Eliminar usuario
router.delete('/usuarios/:id', verificarToken, soloAdmin, async (req, res) => {
  try {
    await Usuario.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Usuario eliminado' });
  } catch (err) {
    res.status(500).json({ msg: 'Error', error: err.message });
  }
});

module.exports = router;