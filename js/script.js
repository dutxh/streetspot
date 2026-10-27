'use strict';

console.log('Street Spot: скрипты подключены');

let courts = [];
const favorites = new Set();

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function courtCardHtml(court) {
  const features = [court.surface];
  if (court.lighting) {
    features.push('Освещение');
  }
  if (court.nets) {
    features.push('Сетки');
  }

  const isFavorite = favorites.has(court.id);

  return `
    <article class="court-card" data-id="${court.id}">
      <h2 class="court-card-title">${escapeHtml(court.name)}</h2>
      <p class="court-card-desc">${escapeHtml(court.address)} • ${escapeHtml(features.join(' • '))}</p>
      <div class="court-card-actions">
        <a href="court.html" class="btn btn-secondary">Подробнее</a>
        <button type="button" class="favorite-btn${isFavorite ? ' active' : ''}" aria-pressed="${isFavorite}" aria-label="Добавить в избранное"></button>
      </div>
    </article>
  `;
}

function toggleFavorite(button) {
  const card = button.closest('.court-card');
  const id = Number(card.dataset.id);

  if (favorites.has(id)) {
    favorites.delete(id);
  } else {
    favorites.add(id);
  }

  const isFavorite = favorites.has(id);
  button.classList.toggle('active', isFavorite);
  button.setAttribute('aria-pressed', String(isFavorite));
}

function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');

  if (!toggle || !nav) {
    return;
  }

  toggle.addEventListener('click', () => {
    const opened = nav.classList.toggle('open');
    toggle.classList.toggle('active', opened);
    toggle.setAttribute('aria-expanded', String(opened));
  });
}

function initPlayersCounter() {
  const playersList = document.querySelector('.players-list');
  const playersCount = document.querySelector('.players-count');
  const joinButton = document.querySelector('.join-btn');

  if (!playersList || !playersCount) {
    return;
  }

  function updatePlayersCount() {
    const total = playersList.querySelectorAll('.player-item').length;
    playersCount.textContent = total;
  }

  function animatePlayersCount() {
    const target = playersList.querySelectorAll('.player-item').length;
    let current = 0;

    const timer = setInterval(() => {
      current += 1;
      playersCount.textContent = current;

      if (current >= target) {
        clearInterval(timer);
      }
    }, 150);
  }

  function toggleJoinState() {
    const isJoined = joinButton.classList.toggle('active');

    if (isJoined) {
      joinButton.textContent = 'Вы записаны';

      const item = document.createElement('li');
      item.className = 'player-item';
      item.dataset.me = 'true';

      const name = document.createElement('span');
      name.className = 'player-name';
      name.textContent = 'Вы';

      const time = document.createElement('span');
      time.className = 'player-time';
      time.textContent = 'Сейчас';

      item.append(name, time);
      playersList.append(item);
    } else {
      joinButton.textContent = 'Я буду играть';

      const me = playersList.querySelector('[data-me="true"]');
      if (me) {
        me.remove();
      }
    }

    updatePlayersCount();
  }

  animatePlayersCount();

  if (joinButton) {
    joinButton.addEventListener('click', toggleJoinState);
  }
}

function initModal() {
  const modal = document.querySelector('.modal');
  const openButton = document.querySelector('.open-modal-btn');

  if (!modal || !openButton) {
    return;
  }

  const closeTargets = modal.querySelectorAll('[data-modal-close]');
  const modalForm = modal.querySelector('.modal-form');

  function openModal() {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
  }

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
  }

  openButton.addEventListener('click', openModal);

  closeTargets.forEach((target) => {
    target.addEventListener('click', closeModal);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });

  if (modalForm) {
    modalForm.addEventListener('submit', (event) => {
      event.preventDefault();
      modalForm.reset();
      closeModal();
    });
  }
}

function initAccordion() {
  const accordions = document.querySelectorAll('.accordion');

  accordions.forEach((accordion) => {
    const toggle = accordion.querySelector('.accordion-toggle');

    if (!toggle) {
      return;
    }

    toggle.addEventListener('click', () => {
      const opened = accordion.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(opened));
    });
  });
}

function initCatalog() {
  const list = document.querySelector('#courts-list');

  if (!list) {
    return;
  }

  const search = document.querySelector('.catalog-query');
  const surfaceFilter = document.querySelector('.catalog-filter-surface');
  const sortSelect = document.querySelector('.catalog-sort');
  const counter = document.querySelector('.catalog-count');
  const empty = document.querySelector('.catalog-empty');
  const stateText = document.querySelector('.catalog-state-text');
  const retryButton = document.querySelector('.catalog-retry');

  function renderCourts(items) {
    if (items.length === 0) {
      list.innerHTML = '';
      if (empty) {
        empty.hidden = false;
      }
      return;
    }

    if (empty) {
      empty.hidden = true;
    }

    list.innerHTML = items.map(courtCardHtml).join('');
  }

  function applyFilters() {
    const query = (search ? search.value : '').trim().toLowerCase();
    const surface = surfaceFilter ? surfaceFilter.value : 'all';
    const sort = sortSelect ? sortSelect.value : 'default';

    const filtered = courts.filter((court) => {
      const matchesQuery = court.name.toLowerCase().includes(query)
        || court.address.toLowerCase().includes(query);
      const matchesSurface = surface === 'all' || court.surface === surface;

      return matchesQuery && matchesSurface;
    });

    const sorted = [...filtered];

    if (sort === 'name-asc') {
      sorted.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
    } else if (sort === 'name-desc') {
      sorted.sort((a, b) => b.name.localeCompare(b.name, 'ru'));
    } else if (sort === 'rating') {
      sorted.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'players') {
      sorted.sort((a, b) => b.players - a.players);
    }

    if (counter) {
      counter.textContent = sorted.length;
    }

    renderCourts(sorted);
  }

  function showState(message, withRetry) {
    if (stateText) {
      stateText.textContent = message;
    }
    if (retryButton) {
      retryButton.hidden = !withRetry;
    }
  }

  async function loadCourts() {
    showState('Загрузка площадок…', false);
    list.innerHTML = '';
    if (empty) {
      empty.hidden = true;
    }

    if (typeof getCourts !== 'function') {
      showState('Не удалось загрузить площадки.', true);
      return;
    }

    try {
      const data = await getCourts();
      courts = data;
      favorites.clear();
      courts.forEach((court) => {
        if (court.favorite) {
          favorites.add(court.id);
        }
      });

      showState('', false);
      applyFilters();
    } catch {
      showState('Не удалось загрузить площадки. Проверьте соединение и повторите попытку.', true);
    }
  }

  list.addEventListener('click', (event) => {
    const button = event.target.closest('.favorite-btn');

    if (button) {
      toggleFavorite(button);
    }
  });

  if (search) {
    search.addEventListener('input', applyFilters);
  }
  if (surfaceFilter) {
    surfaceFilter.addEventListener('change', applyFilters);
  }
  if (sortSelect) {
    sortSelect.addEventListener('change', applyFilters);
  }
  if (retryButton) {
    retryButton.addEventListener('click', loadCourts);
  }

  loadCourts();
}

function initHomePage() {
  const popularList = document.querySelector('#popular-list');
  const catalogList = document.querySelector('#home-catalog-list');

  if (!popularList && !catalogList) {
    return;
  }

  const search = document.querySelector('.home-search');
  const filterBoxes = document.querySelectorAll('.home-filters input');
  const stateText = document.querySelector('.home-state-text');
  const empty = document.querySelector('.home-empty');

  const surfaceMap = {
    rubber: 'Резина',
    asphalt: 'Асфальт',
    parquet: 'Паркет'
  };

  function selectedValues(name) {
    return Array.from(document.querySelectorAll(`.home-filters input[name="${name}"]`))
      .filter((box) => box.checked)
      .map((box) => box.value);
  }

  function renderPopular() {
    if (!popularList) {
      return;
    }

    const top = [...courts].sort((a, b) => b.rating - a.rating).slice(0, 3);
    popularList.innerHTML = top.map(courtCardHtml).join('');
  }

  function renderHeroStats() {
    const courtsStat = document.querySelector('#hero-courts');
    const playersStat = document.querySelector('#hero-players');

    if (courtsStat) {
      courtsStat.textContent = courts.length;
    }
    if (playersStat) {
      playersStat.textContent = courts.reduce((sum, court) => sum + (court.players || 0), 0);
    }
  }

  function applyHomeFilters() {
    if (!catalogList) {
      return;
    }

    const query = (search ? search.value : '').trim().toLowerCase();
    const surfaces = selectedValues('surface').map((value) => surfaceMap[value] || value);
    const features = selectedValues('feature');

    const result = courts.filter((court) => {
      const matchesQuery = court.name.toLowerCase().includes(query)
        || court.address.toLowerCase().includes(query);
      const matchesSurface = surfaces.length === 0 || surfaces.includes(court.surface);
      const matchesFeatures = features.every((feature) => {
        if (feature === 'lighting') {
          return court.lighting;
        }
        if (feature === 'net') {
          return court.nets;
        }
        return true;
      });

      return matchesQuery && matchesSurface && matchesFeatures;
    });

    if (empty) {
      empty.hidden = result.length !== 0;
    }

    catalogList.innerHTML = result.map(courtCardHtml).join('');
  }

  function showState(message) {
    if (stateText) {
      stateText.textContent = message;
    }
  }

  async function loadHome() {
    showState('Загрузка площадок…');

    if (typeof getCourts !== 'function') {
      showState('Не удалось загрузить площадки.');
      return;
    }

    try {
      const data = await getCourts();
      courts = data;
      favorites.clear();
      courts.forEach((court) => {
        if (court.favorite) {
          favorites.add(court.id);
        }
      });

      showState('');
      renderPopular();
      renderHeroStats();
      applyHomeFilters();
    } catch {
      showState('Не удалось загрузить площадки. Проверьте соединение.');
    }
  }

  [popularList, catalogList].forEach((container) => {
    if (!container) {
      return;
    }

    container.addEventListener('click', (event) => {
      const button = event.target.closest('.favorite-btn');

      if (button) {
        toggleFavorite(button);
      }
    });
  });

  if (search) {
    search.addEventListener('input', applyHomeFilters);

    const searchForm = search.closest('form');
    if (searchForm) {
      searchForm.addEventListener('submit', (event) => event.preventDefault());
    }
  }

  filterBoxes.forEach((box) => box.addEventListener('change', applyHomeFilters));

  const filterForm = document.querySelector('.home-filters');
  if (filterForm) {
    filterForm.addEventListener('submit', (event) => event.preventDefault());
  }

  document.querySelectorAll('.hero-quick-item[data-filter]').forEach((link) => {
    link.addEventListener('click', () => {
      const box = document.querySelector(`.home-filters input[name="${link.dataset.filter}"][value="${link.dataset.value}"]`);

      if (box) {
        box.checked = true;
        applyHomeFilters();
      }
    });
  });

  loadHome();
}

function initFormValidation() {
  const form = document.querySelector('.add-court-form');

  if (!form) {
    return;
  }

  const success = document.querySelector('.form-success');
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const rules = {
    court_name: (value) => (value.trim().length >= 3 ? '' : 'Укажите название площадки (минимум 3 символа)'),
    court_address: (value) => (value.trim().length > 0 ? '' : 'Укажите адрес или ориентир'),
    court_contact: (value) => (emailPattern.test(value.trim()) ? '' : 'Введите корректный email'),
    court_description: (value) => (value.trim().length >= 20 ? '' : 'Описание должно содержать минимум 20 символов')
  };

  function showError(field, message) {
    const errorElement = form.querySelector(`[data-error-for="${field.id}"]`);

    field.classList.toggle('input-error', Boolean(message));

    if (errorElement) {
      errorElement.textContent = message;
    }
  }

  function validateField(field) {
    const rule = rules[field.name];

    if (!rule) {
      return true;
    }

    const message = rule(field.value);
    showError(field, message);

    return message === '';
  }

  Object.keys(rules).forEach((name) => {
    const field = form.elements[name];

    if (!field) {
      return;
    }

    field.addEventListener('input', () => validateField(field));
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    let isValid = true;

    Object.keys(rules).forEach((name) => {
      const field = form.elements[name];

      if (!field) {
        return;
      }

      if (!validateField(field)) {
        isValid = false;
      }
    });

    if (!isValid) {
      if (success) {
        success.hidden = true;
      }
      return;
    }

    form.reset();
    form.querySelectorAll('.input-error').forEach((element) => element.classList.remove('input-error'));
    form.querySelectorAll('.field-error').forEach((element) => { element.textContent = ''; });

    if (success) {
      success.hidden = false;
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initPlayersCounter();
  initModal();
  initAccordion();
  initCatalog();
  initHomePage();
  initFormValidation();
});
