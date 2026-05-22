const jwt = require('jsonwebtoken');

exports.verificarToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ msg: 'Sin token de acceso' });
  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(403).json({ msg: 'Token inválido o expirado' });
  }
};

exports.soloAdmin = (req, res, next) => {
  if (req.usuario?.rol !== 'administrador')
    return res.status(403).json({ msg: 'Solo administradores' });
  next();
};

exports.soloOperador = (req, res, next) => {
  const roles = ['administrador', 'operador'];
  if (!roles.includes(req.usuario?.rol))
    return res.status(403).json({ msg: 'Acceso no autorizado' });
  next();
};

exports.soloConductor = (req, res, next) => {
  const roles = ['administrador', 'conductor'];
  if (!roles.includes(req.usuario?.rol))
    return res.status(403).json({ msg: 'Acceso no autorizado' });
  next();
};