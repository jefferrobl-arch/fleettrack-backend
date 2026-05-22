const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const usuario = await Usuario.findOne({ email });

    if (!usuario)
      return res.status(401).json({ msg: 'Credenciales incorrectas' });

    // Verificar si está bloqueado
    if (usuario.estado === 'bloqueado' && usuario.bloqueado_hasta > new Date())
      return res.status(403).json({ msg: 'Cuenta bloqueada. Intenta en 15 minutos.' });

    const valida = await bcrypt.compare(password, usuario.password_hash);

    if (!valida) {
      usuario.intentos_fallidos += 1;
      if (usuario.intentos_fallidos >= 3) {
        usuario.estado = 'bloqueado';
        usuario.bloqueado_hasta = new Date(Date.now() + 15 * 60 * 1000);
      }
      await usuario.save();
      return res.status(401).json({ msg: 'Credenciales incorrectas' });
    }

    // Login exitoso
    usuario.intentos_fallidos = 0;
    usuario.estado = 'activo';
    await usuario.save();

    const token = jwt.sign(
      { id: usuario._id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, rol: usuario.rol, nombre: usuario.nombre });

  } catch (err) {
    res.status(500).json({ msg: 'Error del servidor', error: err.message });
  }
});

router.post('/registro', async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    const existe = await Usuario.findOne({ email });
    if (existe)
      return res.status(400).json({ msg: 'El email ya está registrado' });

    const usuario = new Usuario({ nombre, email, password_hash: password, rol });
    await usuario.save();

    res.status(201).json({ msg: 'Usuario creado correctamente' });

  } catch (err) {
    res.status(500).json({ msg: 'Error del servidor', error: err.message });
  }
});

module.exports = router;