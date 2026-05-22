const mongoose = require('mongoose');

const conductorSchema = new mongoose.Schema({
  usuario_id:     { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  foto_perfil:    { type: String, default: '' },
  telefono:       { type: String },
  telefono_emergencia: { type: String },
  contacto_emergencia: { type: String },
  fecha_nacimiento: { type: Date },
  direccion:      { type: String },
  tipo_licencia:  { type: String, enum: ['A1','A2','B1','B2','B3','C1','C2','C3'], default: 'B1' },
  vence_licencia: { type: Date },
  estado:         { type: String, enum: ['disponible','en_ruta','descanso','inactivo'], default: 'disponible' },
  vehiculo_asignado: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehiculo' },
  empresa_id:     { type: mongoose.Schema.Types.ObjectId, ref: 'Empresa' },
  documentos: [{
    tipo:      { type: String },
    nombre:    { type: String },
    url:       { type: String },
    vence:     { type: Date },
    estado:    { type: String, enum: ['vigente','por_vencer','vencido'], default: 'vigente' }
  }],
  fotos_vehiculo: [{ type: String }],
  notas:          { type: String },
  activo:         { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Conductor', conductorSchema);  