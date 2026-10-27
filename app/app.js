const path = require('path');
const express = require('express');
const logger = require('./middleware/logger');
const { notFound, errorHandler } = require('./middleware/errors');
const courtsRouter = require('./routes/courts');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(logger);
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/debug/error', () => {
  throw new Error('Тестовая ошибка сервера');
});

app.use('/api/courts', courtsRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Street Spot: сервер запущен на http://localhost:${PORT}`);
});
