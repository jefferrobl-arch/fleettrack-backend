const express = require('express');
const Conductor = require('../models/Conductor');
const Usuario = require('../models/Usuario');
const { verificarToken, soloOperador } = require('../middleware/auth');
const { uploadFotoPerfil, uploadFotoVehiculo, uploadDocumento } = require('../middleware/upload');
const router = express.Router();

// Listar conductores
router.get('/', verificarToken, async (req, res) => {
  try {
    const conductores = await Conductor.find({ activo: true })
      .populate('usuario_id', 'nombre email rol estado')
      .populate('vehiculo_asignado', 'placa marca modelo')
      .sort({ createdAt: -1 });
    res.json(conductores);
  } catch (err) {
    res.status(500).json({ msg: 'Error', error: err.message });
  }
});

// Ver conductor completo
router.get('/:id', verificarToken, async (req, res) => {
  try {
    const conductor = await Conductor.findById(req.params.id)
      .populate('usuario_id', 'nombre email rol estado')
      .populate('vehiculo_asignado', 'placa marca modelo anio');
    if (!conductor) return res.status(404).json({ msg: 'Conductor no encontrado' });
    res.json(conductor);
  } catch (err) {
    res.status(500).json({ msg: 'Error', error: err.message });
  }
});

// Crear conductor (crea usuario + perfil)
router.post('/', verificarToken, soloOperador, async (req, res) => {
  try {
    const {
      nombre, email, password, telefono, telefono_emergencia,
      contacto_emergencia, fecha_nacimiento, direccion,
      tipo_licencia, vence_licencia, notas
    } = req.body;

    const existe = await Usuario.findOne({ email });
    if (existe) return res.status(400).json({ msg: 'El email ya está registrado' });

    const usuario = new Usuario({ nombre, email, password_hash: password, rol: 'conductor' });
    await usuario.save();

    const conductor = new Conductor({
      usuario_id: usuario._id,
      telefono, telefono_emergencia, contacto_emergencia,
      fecha_nacimiento, direccion, tipo_licencia, vence_licencia, notas
    });
    await conductor.save();

    res.status(201).json({ usuario, conductor });
  } catch (err) {
    res.status(500).json({ msg: 'Error creando conductor', error: err.message });
  }
});

// Editar conductor
router.put('/:id', verificarToken, soloOperador, async (req, res) => {
  try {
    const { telefono, telefono_emergencia, contacto_emergencia,
            fecha_nacimiento, direccion, tipo_licencia,
            vence_licencia, estado, notas, vehiculo_asignado } = req.body;
    const conductor = await Conductor.findByIdAndUpdate(
      req.params.id,
      { telefono, telefono_emergencia, contacto_emergencia,
        fecha_nacimiento, direccion, tipo_licencia,
        vence_licencia, estado, notas, vehiculo_asignado },
      { new: true }
    ).populate('usuario_id', 'nombre email');
    res.json(conductor);
  } catch (err) {
    res.status(500).json({ msg: 'Error editando conductor', error: err.message });
  }
});

// Subir foto de perfil
router.post('/:id/foto-perfil', verificarToken, soloOperador,
  uploadFotoPerfil.single('foto'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: 'No se subió ninguna imagen' });
    const url = `uploads/conductores/${req.file.filename}`;
    const conductor = await Conductor.findByIdAndUpdate(
      req.params.id, { foto_perfil: url }, { new: true }
    );
    res.json({ url, conductor });
  } catch (err) {
    res.status(500).json({ msg: 'Error subiendo foto', error: err.message });
  }
});

// Subir foto del vehículo
router.post('/:id/foto-vehiculo', verificarToken, soloOperador,
  uploadFotoVehiculo.single('foto'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: 'No se subió ninguna imagen' });
    const url = `uploads/vehiculos/${req.file.filename}`;
    const conductor = await Conductor.findByIdAndUpdate(
      req.params.id, { $push: { fotos_vehiculo: url } }, { new: true }
    );
    res.json({ url, conductor });
  } catch (err) {
    res.status(500).json({ msg: 'Error subiendo foto', error: err.message });
  }
});

// Subir documento
router.post('/:id/documento', verificarToken, soloOperador,
  uploadDocumento.single('archivo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: 'No se subió ningún archivo' });
    const { tipo, vence } = req.body;
    const url = `uploads/documentos/${req.file.filename}`;

    // Verificar si vence pronto (menos de 30 días)
    let estadoDoc = 'vigente';
    if (vence) {
      const diasRestantes = (new Date(vence) - new Date()) / (1000 * 60 * 60 * 24);
      if (diasRestantes < 0) estadoDoc = 'vencido';
      else if (diasRestantes < 30) estadoDoc = 'por_vencer';
    }

    const conductor = await Conductor.findByIdAndUpdate(
      req.params.id,
      { $push: { documentos: { tipo, nombre: req.file.originalname, url, vence, estado: estadoDoc } } },
      { new: true }
    );
    res.json({ url, conductor });
  } catch (err) {
    res.status(500).json({ msg: 'Error subiendo documento', error: err.message });
  }
});

// Eliminar documento
router.delete('/:id/documento/:docId', verificarToken, soloOperador, async (req, res) => {
  try {
    await Conductor.findByIdAndUpdate(
      req.params.id,
      { $pull: { documentos: { _id: req.params.docId } } }
    );
    res.json({ msg: 'Documento eliminado' });
  } catch (err) {
    res.status(500).json({ msg: 'Error', error: err.message });
  }
});

// Eliminar conductor
router.delete('/:id', verificarToken, soloOperador, async (req, res) => {
  try {
    const conductor = await Conductor.findByIdAndUpdate(
      req.params.id, { activo: false }, { new: true }
    );
    await Usuario.findByIdAndUpdate(conductor.usuario_id, { estado: 'bloqueado' });
    res.json({ msg: 'Conductor eliminado' });
  } catch (err) {
    res.status(500).json({ msg: 'Error', error: err.message });
  }
});

module.exports = router;