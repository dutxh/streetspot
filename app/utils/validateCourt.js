const SURFACES = ['rubber', 'asphalt', 'parquet'];

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validateCourt(data, partial = false) {
  const errors = {};

  if (!isPlainObject(data)) {
    errors.body = 'Тело запроса должно быть объектом';
    return errors;
  }

  const has = (field) => Object.prototype.hasOwnProperty.call(data, field);

  if (!partial || has('name')) {
    const name = data.name;
    if (typeof name !== 'string' || name.trim().length < 3 || name.trim().length > 100) {
      errors.name = 'Название — строка от 3 до 100 символов';
    }
  }

  if (!partial || has('address')) {
    const address = data.address;
    if (typeof address !== 'string' || address.trim().length === 0) {
      errors.address = 'Адрес — обязательная непустая строка';
    }
  }

  if (!partial || has('surface')) {
    if (typeof data.surface !== 'string' || !SURFACES.includes(data.surface)) {
      errors.surface = 'Покрытие: rubber, asphalt или parquet';
    }
  }

  ['lighting', 'nets'].forEach((field) => {
    if (!partial || has(field)) {
      if (typeof data[field] !== 'boolean') {
        errors[field] = 'Значение должно быть булевым (true/false)';
      }
    }
  });

  ['rating', 'players'].forEach((field) => {
    if (has(field)) {
      const value = data[field];

      if (typeof value !== 'number' || Number.isNaN(value)) {
        errors[field] = 'Значение должно быть числом';
      } else if (field === 'rating' && (value < 0 || value > 5)) {
        errors.rating = 'Рейтинг должен быть от 0 до 5';
      } else if (field === 'players' && (value < 0 || !Number.isInteger(value))) {
        errors.players = 'Число игроков — целое неотрицательное число';
      }
    }
  });

  return errors;
}

module.exports = { validateCourt, SURFACES };
