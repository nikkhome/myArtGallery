const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// Подключение к базе данных PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@db:5432/art_gallery'
});

// Инициализация таблицы в БД при старте
async function initDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS offers (
        exhibit_id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        contact VARCHAR(100) NOT NULL,
        amount NUMERIC NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Database initialized');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

initDb();

// 1. Получить высшую цену для экспоната
app.get('/api/offers/:exhibitId', async (req, res) => {
  const { exhibitId } = req.params;
  try {
    const result = await pool.query('SELECT amount FROM offers WHERE exhibit_id = $1', [exhibitId]);
    if (result.rows.length > 0) {
      res.json({ amount: parseFloat(result.rows[0].amount) });
    } else {
      res.json({ amount: null });
    }
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// 2. Отправить новую цену
app.post('/api/offers', async (req, res) => {
  const { exhibitId, name, contact, amount } = req.body;

  try {
    // Проверяем текущую максимальную цену
    const current = await pool.query('SELECT amount FROM offers WHERE exhibit_id = $1', [exhibitId]);
    
    if (current.rows.length > 0 && amount <= current.rows[0].amount) {
      return res.status(400).json({ error: 'Offer must be higher than current highest offer' });
    }

    // Сохраняем или обновляем запись
    await pool.query(
      `INSERT INTO offers (exhibit_id, name, contact, amount, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (exhibit_id)
       DO UPDATE SET name = $2, contact = $3, amount = $4, updated_at = NOW()`,
      [exhibitId, name, contact, amount]
    );

    res.json({ success: true, amount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save offer' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));