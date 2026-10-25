'use strict';

const COURTS_API_URL = 'data/courts.json';

async function requestJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Ошибка сети: ' + response.status);
  }

  return response.json();
}

async function getCourts() {
  return requestJson(COURTS_API_URL);
}

async function getCourtById(id) {
  const list = await getCourts();
  return list.find((court) => court.id === Number(id)) || null;
}
