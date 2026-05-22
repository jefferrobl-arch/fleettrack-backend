const mongoose = require('mongoose');

const ubicacionSchema = new mongoose.Schema({
  vehiculo_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehiculo', required: true },
  lat:         { type: Number, required: true },
  lng:         { type: Number, required: true },
  velocidad:   { type: Number, default: 0 },
  senal_gps:   { type: Boolean, default: true },
  timestamp:   { type: Date, default: Date.now }
});

// Índice compuesto para búsquedas rápidas por vehículo
ubicacionSchema.index({ vehiculo_id: 1, timestamp: -1 });

// TTL: los datos se borran automáticamente después de 180 días
ubicacionSchema.index({ timestamp: 1 }, { expireAfterSeconds: 15552000 });

module.exports = mongoose.model('Ubicacion', ubicacionSchema);