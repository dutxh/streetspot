const express = require('express');
const router = express.Router();
const courts = require('../data/courts.json');
const { validateCourt } = require('../utils/validateCourt');

const surfaceMap = {
  rubber: 'Резина',
  asphalt: 'Асфальт',
  parquet: 'Паркет',
  wood: 'Паркет'
};

function nextId() {
  return courts.reduce((max, court) => Math.max(max, court.id), 0) + 1;
}

router.get('/', (req, res) => {
  const { surface, search, sort } = req.query;

  let result = [...courts];

  if (surface) {
    const label = surfaceMap[String(surface).toLowerCase()] || String(surface);
    result = result.filter((court) => court.surface === label);
  }

  if (search) {
    const query = String(search).trim().toLowerCase();
    result = result.filter((court) => (
      court.name.toLowerCase().includes(query)
      || court.address.toLowerCase().includes(query)
    ));
  }

  if (sort === 'rating') {
    result.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'name') {
    result.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  } else if (sort === 'players') {
    result.sort((a, b) => b.players - a.players);
  }

  res.json(result);
});

router.post('/', (req, res) => {
  const errors = validateCourt(req.body);

  if (Object.keys(errors).length > 0) {
    res.status(400).json({ error: 'Ошибка валидации', fields: errors });
    return;
  }

  const court = {
    id: nextId(),
    name: req.body.name.trim(),
    address: req.body.address.trim(),
    surface: req.body.surface,
    lighting: req.body.lighting,
    nets: req.body.nets,
    favorite: false,
    rating: typeof req.body.rating === 'number' ? req.body.rating : 0,
    players: typeof req.body.players === 'number' ? req.body.players : 0
  };

  courts.push(court);
  res.status(201).json(court);
});

router.get('/:id', (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    res.status(400).json({ error: 'Некорректный идентификатор' });
    return;
  }

  const court = courts.find((item) => item.id === id);

  if (!court) {
    res.status(404).json({ error: 'Площадка не найдена' });
    return;
  }

  res.json(court);
});

router.patch('/:id', (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    res.status(400).json({ error: 'Некорректный идентификатор' });
    return;
  }

  const court = courts.find((item) => item.id === id);

  if (!court) {
    res.status(404).json({ error: 'Площадка не найдена' });
    return;
  }

  const errors = validateCourt(req.body, true);

  if (Object.keys(errors).length > 0) {
    res.status(400).json({ error: 'Ошибка валидации', fields: errors });
    return;
  }

  const allowedFields = ['name', 'address', 'surface', 'lighting', 'nets', 'rating', 'players'];

  allowedFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      court[field] = req.body[field];
    }
  });

  res.json(court);
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    res.status(400).json({ error: 'Некорректный идентификатор' });
    return;
  }

  const index = courts.findIndex((item) => item.id === id);

  if (index === -1) {
    res.status(404).json({ error: 'Площадка не найдена' });
    return;
  }

  courts.splice(index, 1);
  res.status(204).end();
});

module.exports = router;
