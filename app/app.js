const path = require('path');
const express = require('express');
const courtsRouter = require('./routes/courts');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/courts', courtsRouter);

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

app.use(express.static(path.join(__dirname, '..')));

app.listen(PORT, () => {
  console.log(`Street Spot: сервер запущен на http://localhost:${PORT}`);
});
