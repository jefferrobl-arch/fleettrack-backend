const express = require('express');
const Pedido = require('../models/Pedido');
const Usuario = require('../models/Usuario');
const { verificarToken, soloOperador } = require('../middleware/auth');
const router = express.Router();

const Producto = require('../models/Producto');

// Crear pedido y descontar stock
router.post('/', verificarToken, soloOperador, async (req, res) => {
  try {
    const { numero, cliente, telefono, origen, destino, descripcion, prioridad, fecha_entrega, productos } = req.body;

    // Verificar stock disponible
    for (const item of productos) {
      const prod = await Producto.findById(item.producto_id);
      if (!prod) return res.status(400).json({ msg: `Producto ${item.nombre} no encontrado` });
      if (prod.stock < item.cantidad) return res.status(400).json({ msg: `Stock insuficiente para ${prod.nombre}. Disponible: ${prod.stock}` });
    }

    // Descontar stock
    for (const item of productos) {
      await Producto.findByIdAndUpdate(item.producto_id, { $inc: { stock: -item.cantidad } });
    }

    const pedido = new Pedido({ numero, cliente, telefono, origen, destino, descripcion, prioridad, fecha_entrega, productos, empresa_id: req.usuario.empresa });
    await pedido.save();
    res.status(201).json(pedido);
  } catch (err) {
    res.status(500).json({ msg: 'Error creando pedido', error: err.message });
  }
});

// Listar pedidos
router.get('/', verificarToken, async (req, res) => {
  try {
    const filtro = req.usuario.rol === 'conductor'
      ? { conductor_id: req.usuario.id }
      : {};
    const pedidos = await Pedido.find(filtro)
      .populate('conductor_id', 'nombre email')
      .populate('vehiculo_id', 'placa marca')
      .sort({ createdAt: -1 });
    res.json(pedidos);
  } catch (err) {
    res.status(500).json({ msg: 'Error', error: err.message });
  }
});

// Conductores disponibles - DEBE IR ANTES de /:id
router.get('/meta/conductores', verificarToken, soloOperador, async (req, res) => {
  try {
    const conductores = await Usuario.find({ rol: 'conductor', estado: 'activo' })
      .select('nombre email');
    res.json(conductores);
  } catch (err) {
    res.status(500).json({ msg: 'Error', error: err.message });
  }
});

// Ver pedido completo - SIEMPRE DESPUÉS de rutas específicas
router.get('/:id', verificarToken, async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id)
      .populate('conductor_id', 'nombre email')
      .populate('vehiculo_id', 'placa marca');
    if (!pedido) return res.status(404).json({ msg: 'Pedido no encontrado' });
    res.json(pedido);
  } catch (err) {
    res.status(500).json({ msg: 'Error', error: err.message });
  }
});

// Asignar conductor (operador/admin)
router.put('/:id/asignar', verificarToken, soloOperador, async (req, res) => {
  try {
    const { conductor_id } = req.body;
    const pedido = await Pedido.findByIdAndUpdate(
      req.params.id,
      { conductor_id, estado: 'asignado' },
      { new: true }
    ).populate('conductor_id', 'nombre email');
    res.json(pedido);
  } catch (err) {
    res.status(500).json({ msg: 'Error asignando pedido', error: err.message });
  }
});

router.put('/:id/estado', verificarToken, soloOperador, async (req, res) => {
  try {
    const { estado } = req.body;
    const pedido = await Pedido.findById(req.params.id);

    // Si cambia a devolución, devolver stock
    if (estado === 'devolucion' && pedido.estado !== 'devolucion') {
      for (const item of pedido.productos) {
        if (item.producto_id) {
          await Producto.findByIdAndUpdate(item.producto_id, { $inc: { stock: item.cantidad } });
        }
      }
    }

    const update = { estado };
    if (estado === 'entregado') update.entregado_en = new Date();
    const pedidoActualizado = await Pedido.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(pedidoActualizado);
  } catch (err) {
    res.status(500).json({ msg: 'Error', error: err.message });
  }
});

// Reportar novedad (solo conductor)
router.put('/:id/novedad', verificarToken, async (req, res) => {
  try {
    if (req.usuario.rol !== 'conductor' && req.usuario.rol !== 'administrador')
      return res.status(403).json({ msg: 'Solo conductores pueden reportar novedades' });
    const { novedad } = req.body;
    const pedido = await Pedido.findByIdAndUpdate(
      req.params.id,
      { novedad, novedad_fecha: new Date() },
      { new: true }
    );
    res.json(pedido);
  } catch (err) {
    res.status(500).json({ msg: 'Error', error: err.message });
  }
});

// Conductores disponibles para asignar
router.get('/meta/conductores', verificarToken, soloOperador, async (req, res) => {
  try {
    const conductores = await Usuario.find({ rol: 'conductor', estado: 'activo' })
      .select('nombre email');
    res.json(conductores);
  } catch (err) {
    res.status(500).json({ msg: 'Error', error: err.message });
  }
});

module.exports = router;