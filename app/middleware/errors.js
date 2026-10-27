const path = require('path');

function notFound(req, res) {
  if (req.path.startsWith('/api')) {
    res.status(404).json({ error: 'Маршрут не найден' });
    return;
  }

  res.status(404).sendFile(path.join(__dirname, '..', '..', '404.html'));
}

function errorHandler(err, req, res, next) {
  console.error(err.stack || err);

  if (err.type === 'entity.parse.failed' || err instanceof SyntaxError) {
    res.status(400).json({ error: 'Некорректный JSON' });
    return;
  }

  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
}

module.exports = { notFound, errorHandler };
