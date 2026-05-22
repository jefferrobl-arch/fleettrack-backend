const mongoose = require('mongoose');

const pedidoSchema = new mongoose.Schema({
  numero:        { type: String, required: true, unique: true },
  cliente:       { type: String, required: true },
  telefono:      { type: String },
  origen:        { type: String, required: true },
  destino:       { type: String, required: true },
  descripcion:   { type: String },
  productos: [{
  producto_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto' },
  nombre:      { type: String, required: true },
  cantidad:    { type: Number, required: true },
  unidad:      { type: String, default: 'und' },
  peso_kg:     { type: Number, default: 0 }
}],
  conductor_id:  { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  vehiculo_id:   { type: mongoose.Schema.Types.ObjectId, ref: 'Vehiculo' },
  empresa_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'Empresa' },
  estado:        { type: String, enum: ['pendiente','asignado','en_ruta','entregado','devolucion','faltante'], default: 'pendiente' },
  prioridad:     { type: String, enum: ['baja','media','alta'], default: 'media' },
  notas:         { type: String },
  novedad:       { type: String },
  novedad_fecha: { type: Date },
  archivos:      [{ nombre: String, url: String, tipo: String }],
  fecha_entrega: { type: Date },
  entregado_en:  { type: Date }
}, { timestamps: true });

pedidoSchema.index({ estado: 1 });
pedidoSchema.index({ conductor_id: 1, estado: 1 });

module.exports = mongoose.model('Pedido', pedidoSchema);