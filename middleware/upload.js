const multer = require('multer');
const path = require('path');
const fs = require('fs');

function crearStorage(carpeta) {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = `uploads/${carpeta}`;
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const nombre = `${carpeta}_${Date.now()}${ext}`;
      cb(null, nombre);
    }
  });
}

const filtroImagenes = (req, file, cb) => {
  const permitidos = /jpeg|jpg|png|webp/;
  const esValido = permitidos.test(path.extname(file.originalname).toLowerCase());
  if (esValido) cb(null, true);
  else cb(new Error('Solo se permiten imágenes (jpg, png, webp)'));
};

const filtroDocumentos = (req, file, cb) => {
  const permitidos = /jpeg|jpg|png|webp|pdf/;
  const esValido = permitidos.test(path.extname(file.originalname).toLowerCase());
  if (esValido) cb(null, true);
  else cb(new Error('Solo se permiten imágenes o PDF'));
};

exports.uploadFotoPerfil  = multer({ storage: crearStorage('conductores'), fileFilter: filtroImagenes, limits: { fileSize: 5 * 1024 * 1024 } });
exports.uploadFotoVehiculo= multer({ storage: crearStorage('vehiculos'),   fileFilter: filtroImagenes, limits: { fileSize: 5 * 1024 * 1024 } });
exports.uploadDocumento   = multer({ storage: crearStorage('documentos'),  fileFilter: filtroDocumentos, limits: { fileSize: 10 * 1024 * 1024 } });