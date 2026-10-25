const express = require('express');
const router = express.Router();
const courts = require('../data/courts.json');

const surfaceMap = {
  rubber: 'Резина',
  asphalt: 'Асфальт',
  parquet: 'Паркет',
  wood: 'Паркет'
};

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

module.exports = router;
