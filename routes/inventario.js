const express = require('express');
const Producto = require('../models/Producto');
const { verificarToken, soloOperador } = require('../middleware/auth');
const router = express.Router();

// Listar todos los productos
router.get('/', verificarToken, async (req, res) => {
  try {
    const productos = await Producto.find({ activo: true }).sort({ nombre: 1 });
    res.json(productos);
  } catch (err) {
    res.status(500).json({ msg: 'Error', error: err.message });
  }
});

// Crear producto
router.post('/', verificarToken, soloOperador, async (req, res) => {
  try {
    const { nombre, descripcion, unidad, stock, stock_minimo, peso_kg, categoria } = req.body;
    const existe = await Producto.findOne({ nombre, activo: true });
    if (existe) return res.status(400).json({ msg: 'Ya existe un producto con ese nombre' });
    const producto = new Producto({ nombre, descripcion, unidad, stock, stock_minimo, peso_kg, categoria });
    await producto.save();
    res.status(201).json(producto);
  } catch (err) {
    res.status(500).json({ msg: 'Error creando producto', error: err.message });
  }
});

// Agregar stock (entrada de mercancía)
router.put('/:id/entrada', verificarToken, soloOperador, async (req, res) => {
  try {
    const { cantidad } = req.body;
    const producto = await Producto.findByIdAndUpdate(
      req.params.id,
      { $inc: { stock: cantidad } },
      { new: true }
    );
    res.json(producto);
  } catch (err) {
    res.status(500).json({ msg: 'Error', error: err.message });
  }
});

// Editar producto
router.put('/:id', verificarToken, soloOperador, async (req, res) => {
  try {
    const { nombre, descripcion, unidad, stock_minimo, peso_kg, categoria } = req.body;
    const producto = await Producto.findByIdAndUpdate(
      req.params.id,
      { nombre, descripcion, unidad, stock_minimo, peso_kg, categoria },
      { new: true }
    );
    res.json(producto);
  } catch (err) {
    res.status(500).json({ msg: 'Error', error: err.message });
  }
});

// Eliminar producto (desactivar)
router.delete('/:id', verificarToken, soloOperador, async (req, res) => {
  try {
    await Producto.findByIdAndUpdate(req.params.id, { activo: false });
    res.json({ msg: 'Producto eliminado' });
  } catch (err) {
    res.status(500).json({ msg: 'Error', error: err.message });
  }
});

module.exports = router;