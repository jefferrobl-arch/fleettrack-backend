const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  nombre:      { type: String, required: true },
  descripcion: { type: String },
  unidad:      { type: String, default: 'und' },
  stock:       { type: Number, required: true, default: 0 },
  stock_minimo:{ type: Number, default: 5 },
  peso_kg:     { type: Number, default: 0 },
  categoria:   { type: String, default: 'General' },
  empresa_id:  { type: mongoose.Schema.Types.ObjectId, ref: 'Empresa' },
  activo:      { type: Boolean, default: true }
}, { timestamps: true });

productoSchema.index({ nombre: 1 });

module.exports = mongoose.model('Producto', productoSchema);