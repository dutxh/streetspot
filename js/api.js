'use strict';

const API_BASE_URL = '/api';

function buildQuery(params) {
  const query = new URLSearchParams();

  Object.keys(params).forEach((key) => {
    const value = params[key];

    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value);
    }
  });

  const stringified = query.toString();
  return stringified ? `?${stringified}` : '';
}

async function requestJson(path, options = {}) {
  const config = {
    ...options,
    headers: { ...(options.headers || {}) }
  };

  if (options.body !== undefined) {
    config.headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${path}`, config);

  if (response.status === 204) {
    return null;
  }

  let data = null;
  const text = await response.text();

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const error = new Error((data && data.error) || `Ошибка сети: ${response.status}`);
    error.status = response.status;
    error.fields = (data && data.fields) || {};
    throw error;
  }

  return data;
}

async function getCourts(params = {}) {
  return requestJson(`/courts${buildQuery(params)}`);
}

async function getCourtById(id) {
  return requestJson(`/courts/${encodeURIComponent(id)}`);
}

async function createCourt(court) {
  return requestJson('/courts', {
    method: 'POST',
    body: JSON.stringify(court)
  });
}

async function updateCourt(id, changes) {
  return requestJson(`/courts/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(changes)
  });
}

async function deleteCourt(id) {
  return requestJson(`/courts/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
}
