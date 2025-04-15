const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Conexão com o CockroachDB
const pool = new Pool({
  connectionString: 'postgresql://fernando:jSfy8wDUt8D54nRPsEEfQA@eu-estou-aqui-10239.j77.aws-us-west-2.cockroachlabs.cloud:26257/presencas?sslmode=verify-full',
  ssl: { rejectUnauthorized: false }
});

// Rota para registrar presença
app.post('/registrar-presenca', async (req, res) => {
  const { id, eventoId, latitude, longitude, precisao } = req.body;
  try {
    await pool.query(
      'INSERT INTO presencas (id, eventoId, latitude, longitude, precisao) VALUES ($1, $2, $3, $4, $5)',
      [id, eventoId, latitude, longitude, precisao]
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

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});