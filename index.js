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

// Rota para verificar se um registro existe
app.get('/registro/exists/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT 1 FROM registros WHERE id = $1', [id]);
    res.status(200).json({ exists: result.rowCount > 0 });
  } catch (error) {
    console.error('Erro ao verificar registro:', error);
    res.status(500).json({ error: 'Erro ao verificar registro' });
  }
});

// Rota para registrar presença
app.post('/registrar-presenca', async (req, res) => {
  const { userId, eventoId } = req.body;
  const registroId = `${userId}_presenca_${eventoId}`;
  try {
    // Verificar se o registro já existe
    const existsResult = await pool.query('SELECT 1 FROM registros WHERE id = $1', [registroId]);
    if (existsResult.rowCount > 0) {
      return res.status(400).json({ success: false, error: 'Presença já registrada' });
    }

    // Inserir novo registro
    await pool.query('INSERT INTO registros (id) VALUES ($1)', [registroId]);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erro ao registrar presença:', error);
    res.status(500).json({ error: 'Erro ao registrar presença' });
  }
});

// Rota para registrar apoio
app.post('/registrar-apoio', async (req, res) => {
  const { userId, eventoId } = req.body;
  const registroId = `${userId}_apoio_${eventoId}`;
  try {
    // Verificar se o registro já existe
    const existsResult = await pool.query('SELECT 1 FROM registros WHERE id = $1', [registroId]);
    if (existsResult.rowCount > 0) {
      return res.status(400).json({ success: false, error: 'Apoio já registrado' });
    }

    // Inserir novo registro
    await pool.query('INSERT INTO registros (id) VALUES ($1)', [registroId]);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erro ao registrar apoio:', error);
    res.status(500).json({ error: 'Erro ao registrar apoio' });
  }
});

// Rota para contar presenças
app.get('/total-presencas', async (req, res) => {
  const { eventoId } = req.query;
  try {
    const result = await pool.query(
      'SELECT COUNT(*) FROM registros WHERE id LIKE $1',
      [`%_presenca_${eventoId}`]
    );
    res.status(200).json({ total: parseInt(result.rows[0].count, 10) });
  } catch (error) {
    console.error('Erro ao contar presenças:', error);
    res.status(500).json({ error: 'Erro ao contar presenças' });
  }
});

// Rota para contar apoios
app.get('/total-apoios', async (req, res) => {
  const { eventoId } = req.query;
  try {
    const result = await pool.query(
      'SELECT COUNT(*) FROM registros WHERE id LIKE $1',
      [`%_apoio_${eventoId}`]
    );
    res.status(200).json({ total: parseInt(result.rows[0].count, 10) });
  } catch (error) {
    console.error('Erro ao contar apoios:', error);
    res.status(500).json({ error: 'Erro ao contar apoios' });
  }
});

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});