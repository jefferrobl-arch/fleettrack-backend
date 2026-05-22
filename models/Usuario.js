const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usuarioSchema = new mongoose.Schema({
  nombre:            { type: String, required: true },
  email:             { type: String, required: true, unique: true },
  password_hash:     { type: String, required: true },
  rol:               { type: String, enum: ['conductor', 'operador', 'administrador'], required: true },
  empresa_id:        { type: mongoose.Schema.Types.ObjectId, ref: 'Empresa' },
  estado:            { type: String, enum: ['activo', 'bloqueado'], default: 'activo' },
  intentos_fallidos: { type: Number, default: 0 },
  bloqueado_hasta:   { type: Date }
}, { timestamps: true });

usuarioSchema.pre('save', async function() {
  if (!this.isModified('password_hash')) return;
  this.password_hash = await bcrypt.hash(this.password_hash, 10);
});

module.exports = mongoose.model('Usuario', usuarioSchema);