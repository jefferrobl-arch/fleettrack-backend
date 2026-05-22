const express = require('express');
const Ubicacion = require('../models/Ubicacion');
const { verificarToken } = require('../middleware/auth');
const router = express.Router();

// Guardar ubicación GPS (desde app Android)
router.post('/', verificarToken, async (req, res) => {
  try {
    const { vehiculo_id, lat, lng, velocidad } = req.body;
    const ubicacion = new Ubicacion({ vehiculo_id, lat, lng, velocidad });
    await ubicacion.save();
    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(500).json({ msg: 'Error guardando ubicación', error: err.message });
  }
});

// Última ubicación de toda la flota (para el dashboard)
router.get('/flota', verificarToken, async (req, res) => {
  try {
    const ubicaciones = await Ubicacion.aggregate([
      { $sort: { timestamp: -1 } },
      { $group: { _id: '$vehiculo_id', ultima: { $first: '$$ROOT' } } }
    ]);
    res.json(ubicaciones);
  } catch (err) {
    res.status(500).json({ msg: 'Error obteniendo flota', error: err.message });
  }
});

// Historial de un vehículo específico
router.get('/:vehiculo_id', verificarToken, async (req, res) => {
  try {
    const ubicaciones = await Ubicacion.find({ vehiculo_id: req.params.vehiculo_id })
      .sort({ timestamp: -1 })
      .limit(100);
    res.json(ubicaciones);
  } catch (err) {
    res.status(500).json({ msg: 'Error obteniendo historial', error: err.message });
  }
});

module.exports = router;