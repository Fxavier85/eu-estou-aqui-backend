require('dotenv').config();
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Definida' : 'Não definida');
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Conexão com o CockroachDB
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Rota para registrar presença
app.post('/registrar-presenca', async (req, res) => {
  const { id, eventoId } = req.body;
  try {
    await pool.query(
      'INSERT INTO presencas (id, eventoId) VALUES ($1, $2)',
      [id, eventoId]
    );
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao registrar presença' });
  }
});

// Rota para contar presenças
app.get('/total-presencas', async (req, res) => {
  const { eventoId } = req.query;
  try {
    const result = await pool.query(
      'SELECT COUNT(*) FROM presencas WHERE eventoId = $1',
      [eventoId]
    );
    res.status(200).json({ total: parseInt(result.rows[0].count) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao contar presenças' });
  }
});

// Rota para registrar apoio
app.post('/registrar-apoio', async (req, res) => {
  const { id, eventoId } = req.body;
  try {
    await pool.query(
      'INSERT INTO apoios (id, eventoId) VALUES ($1, $2)',
      [id, eventoId]
    );
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao registrar apoio' });
  }
});

// Rota para contar apoios
app.get('/total-apoios', async (req, res) => {
  const { eventoId } = req.query;
  try {
    const result = await pool.query(
      'SELECT COUNT(*) FROM apoios WHERE eventoId = $1',
      [eventoId]
    );
    res.status(200).json({ total: parseInt(result.rows[0].count) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao contar apoios' });
  }
});

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});