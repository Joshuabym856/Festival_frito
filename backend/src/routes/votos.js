const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const verificarAuth = require('../middlewares/middleware');

// un get para el Top 5 fritos más votados
router.get('/top5', async (req, res) => {
  const { data, error } = await supabase
    .from('top5_fritos')
    .select('*');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// un get para los votos de un frito en específico
router.get('/:fritoId', async (req, res) => {
  const { fritoId } = req.params;

  const { count, error } = await supabase
    .from('votos')
    .select('*', { count: 'exact', head: true })
    .eq('frito_id', fritoId);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ total_votos: count });
});

// un post para votar por un frito (requiere autenticación)
router.post('/', verificarAuth, async (req, res) => {
  const { frito_id } = req.body;
  const usuario_id = req.user.id;

  const { data, error } = await supabase
    .from('votos')
    .insert([{ usuario_id, frito_id }]);

  if (error) return res.status(400).json({ error: 'Ya votaste por este frito' });
  res.status(201).json({ mensaje: '¡Voto registrado!', data });
});

// un delete para quitar el voto (requiere autenticación)
router.delete('/:fritoId', verificarAuth, async (req, res) => {
  const { fritoId } = req.params;
  const usuario_id = req.user.id;

  const { error } = await supabase
    .from('votos')
    .delete()
    .eq('frito_id', fritoId)
    .eq('usuario_id', usuario_id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ mensaje: 'Voto eliminado' });
});

module.exports = router;