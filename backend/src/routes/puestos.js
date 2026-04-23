const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// un get para todos los puestos
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('puestos')
    .select('*')
    .order('numero_puesto', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// un get para el puesto por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('puestos')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return res.status(404).json({ error: 'Puesto no encontrado' });
  res.json(data);
});

// un get para el puesto filtrado por número de puesto (para el QR)
router.get('/numero/:numero', async (req, res) => {
  const { numero } = req.params;

  const { data, error } = await supabase
    .from('puestos')
    .select('*')
    .eq('numero_puesto', numero)
    .single();

  if (error) return res.status(404).json({ error: 'Puesto no encontrado' });
  res.json(data);
});

module.exports = router;