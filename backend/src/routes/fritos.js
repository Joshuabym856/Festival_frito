const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// un get para todos los fritos
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('fritos')
    .select('*, puestos(nombre, numero_puesto)');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// un get para los fritos por puesto
router.get('/puesto/:puestoId', async (req, res) => {
  const { puestoId } = req.params;

  const { data, error } = await supabase
    .from('fritos')
    .select('*')
    .eq('puesto_id', puestoId);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// un get para los fritos por categoría (para los filtros)
router.get('/categoria/:categoria', async (req, res) => {
  const { categoria } = req.params;

  const { data, error } = await supabase
    .from('fritos')
    .select('*, puestos(nombre, numero_puesto)')
    .ilike('categoria', `%${categoria}%`);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;