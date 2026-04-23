const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// un get para todos los ganadores históricos
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('ganadores_historicos')
    .select('*, puestos(nombre, especialidad, foto_perfil_url)')
    .order('year', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// otro get para los ganadores por año
router.get('/:anio', async (req, res) => {
  const { anio } = req.params;

  const { data, error } = await supabase
    .from('ganadores_historicos')
    .select('*, puestos(nombre, especialidad, foto_perfil_url)')
    .eq('year', anio);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;