const mongoose = require('mongoose');

const vehiculoSchema = new mongoose.Schema({
  placa:       { type: String, required: true, unique: true },
  marca:       { type: String, required: true },
  modelo:      { type: String, required: true },
  anio:        { type: Number, required: true },
  conductor_id:{ type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  empresa_id:  { type: mongoose.Schema.Types.ObjectId, ref: 'Empresa' },
  estado:      { type: String, enum: ['activo', 'inactivo', 'mantenimiento'], default: 'activo' }
}, { timestamps: true });

module.exports = mongoose.model('Vehiculo', vehiculoSchema);