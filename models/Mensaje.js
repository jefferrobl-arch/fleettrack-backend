const mongoose = require('mongoose');

const mensajeSchema = new mongoose.Schema({
  de:         { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  para:       { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  texto:      { type: String, required: true },
  leido:      { type: Boolean, default: false },
  empresa_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Empresa' }
}, { timestamps: true });

mensajeSchema.index({ de: 1, para: 1, createdAt: -1 });

module.exports = mongoose.model('Mensaje', mensajeSchema);