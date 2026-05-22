const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false
}));
app.use(cors({
  origin: [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'https://fleettrack-frontend-gamma.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => console.error('❌ Error MongoDB:', err));

app.use('/api/auth',       require('./routes/auth'));
app.use('/api/ubicaciones',require('./routes/ubicaciones'));
app.use('/api/admin',      require('./routes/admin'));
app.use('/api/pedidos',    require('./routes/pedidos'));
app.use('/api/chat',       require('./routes/chat'));
app.use('/api/inventario', require('./routes/inventario'));
app.use('/uploads', express.static('uploads'));
app.use('/api/conductores', require('./routes/conductores'));

app.get('/', (req, res) => res.json({ mensaje: 'Fleet Backend funcionando 🚀' }));

app.listen(process.env.PORT || 3000, () =>
  console.log(`🚀 Servidor corriendo en puerto ${process.env.PORT || 3000}`)
);