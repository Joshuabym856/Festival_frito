const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
const puestosRoutes   = require('./src/routes/puestos');
const fritosRoutes    = require('./src/routes/fritos');
const votosRoutes     = require('./src/routes/votos');
const ganadoresRoutes = require('./src/routes/ganadores');

app.use('/api/puestos',    puestosRoutes);
app.use('/api/fritos',     fritosRoutes);
app.use('/api/votos',      votosRoutes);
app.use('/api/ganadores',  ganadoresRoutes);

// Ruta para servir el frontend
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/api', (req, res) => {
  res.json({ message: 'API de FritoMapp' });
});

app.get('/inicio', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});


// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});