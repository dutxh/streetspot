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

function courtCardHtml(court, options = {}) {
  const features = [court.surface];
  if (court.lighting) {
    features.push('Освещение');
  }
  if (court.nets) {
    features.push('Сетки');
  }

  const isFavorite = favorites.has(court.id);
  const editLink = options.deletable
    ? `<a href="add-court.html?id=${court.id}" class="btn btn-secondary">Изменить</a>`
    : '';
  const deleteButton = options.deletable
    ? '<button type="button" class="btn btn-danger court-action-btn delete-court-btn">Удалить</button>'
    : '';

  return `
    <article class="court-card" data-id="${court.id}">
      <h2 class="court-card-title">${escapeHtml(court.name)}</h2>
      <p class="court-card-desc">${escapeHtml(court.address)} • ${escapeHtml(features.join(' • '))}</p>
      <div class="court-card-actions">
        <a href="court.html?id=${court.id}" class="btn btn-secondary court-action-btn">Подробнее</a>
        ${editLink}
        ${deleteButton}
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

async function removeCourtFromList(button, onRemoved) {
  const card = button.closest('.court-card');
  const id = Number(card.dataset.id);

  if (!window.confirm('Удалить площадку? Это действие нельзя отменить.')) {
    return;
  }

  if (typeof deleteCourt !== 'function') {
    window.alert('Серверный API недоступен.');
    return;
  }

  button.disabled = true;

  try {
    await deleteCourt(id);
    courts = courts.filter((court) => court.id !== id);
    favorites.delete(id);

    if (typeof onRemoved === 'function') {
      onRemoved();
    }
  } catch (error) {
    window.alert(error.message || 'Не удалось удалить площадку.');
    button.disabled = false;
  }
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

  function getPlayersTotal() {
    const stored = Number(playersList.dataset.total);

    if (playersList.dataset.total !== undefined && Number.isFinite(stored)) {
      return stored;
    }

    return playersList.querySelectorAll('.player-item').length;
  }

  function updatePlayersCount() {
    playersCount.textContent = getPlayersTotal();
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

      if (playersList.dataset.total !== undefined) {
        playersList.dataset.total = String(getPlayersTotal() + 1);
      }
    } else {
      joinButton.textContent = 'Я буду играть';

      const me = playersList.querySelector('[data-me="true"]');
      if (me) {
        me.remove();
      }

      if (playersList.dataset.total !== undefined) {
        playersList.dataset.total = String(Math.max(0, getPlayersTotal() - 1));
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

    list.innerHTML = items.map((court) => courtCardHtml(court, { deletable: true })).join('');
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
    const deleteButton = event.target.closest('.delete-court-btn');

    if (deleteButton) {
      removeCourtFromList(deleteButton, applyFilters);
      return;
    }

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
    popularList.innerHTML = top.map((court) => courtCardHtml(court)).join('');
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

    catalogList.innerHTML = result.map((court) => courtCardHtml(court)).join('');
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

function initCourtPage() {
  const detail = document.querySelector('.court-detail-layout');
  const reviews = document.querySelector('.reviews-section');

  if (!detail) {
    return;
  }

  const stateText = document.querySelector('.court-state-text');
  const backLink = document.querySelector('.court-back-link');
  const title = document.querySelector('#court-title');

  const params = new URLSearchParams(window.location.search);
  const rawId = params.get('id');

  function setText(selector, value) {
    const element = document.querySelector(selector);

    if (element) {
      element.textContent = value;
    }
  }

  function showState(message, withBackLink) {
    if (stateText) {
      stateText.textContent = message;
    }
    if (backLink) {
      backLink.hidden = !withBackLink;
    }
  }

  function hideDetails() {
    detail.hidden = true;

    if (reviews) {
      reviews.hidden = true;
    }
  }

  function showDetails() {
    detail.hidden = false;

    if (reviews) {
      reviews.hidden = false;
    }

    showState('', false);
  }

  function renderPlayers(court) {
    const list = document.querySelector('.players-list');
    const count = document.querySelector('.players-count');

    if (!list) {
      return;
    }

    const total = Number.isInteger(court.players) && court.players > 0 ? court.players : 0;
    const visible = Math.min(total, 5);
    const names = ['Алексей С.', 'Михаил Д.', 'Кирилл Н.', 'Дмитрий М.', 'Иван П.', 'Сергей К.'];
    const times = ['18:00', '18:30', '19:00', '19:30', '20:00'];

    list.innerHTML = '';
    list.dataset.total = String(total);

    for (let index = 0; index < visible; index += 1) {
      const item = document.createElement('li');
      item.className = 'player-item';

      const name = document.createElement('span');
      name.className = 'player-name';
      name.textContent = names[index % names.length];

      const time = document.createElement('span');
      time.className = 'player-time';
      time.textContent = times[index % times.length];

      item.append(name, time);
      list.append(item);
    }

    if (total > visible) {
      const more = document.createElement('li');
      more.className = 'players-more';
      more.textContent = `+ ещё ${total - visible} игроков`;
      list.append(more);
    }

    if (count) {
      count.textContent = total;
    }
  }

  function fillCourt(court) {
    if (title) {
      title.textContent = court.name;
    }
    document.title = `${court.name} — Street Spot`;

    const image = document.querySelector('.court-image');

    if (image) {
      image.src = court.image || 'img/court-photo1.png';
      image.alt = `Фото площадки «${court.name}»`;
    }

    setText('.court-address', court.address);
    setText('.court-surface', court.surface);
    setText('.court-nets', court.nets ? 'Есть сетки' : 'Без сеток');
    setText('.court-lighting', court.lighting ? 'Освещение есть' : 'Без освещения');

    renderPlayers(court);
  }

  async function loadCourt() {
    hideDetails();
    showState('Загрузка площадки…', false);

    if (!rawId) {
      if (title) {
        title.textContent = 'Площадка не выбрана';
      }
      showState('Не указан идентификатор площадки.', true);
      return;
    }

    if (typeof getCourtById !== 'function') {
      if (title) {
        title.textContent = 'Площадка недоступна';
      }
      showState('Не удалось загрузить площадку: серверный API недоступен.', true);
      return;
    }

    try {
      const court = await getCourtById(rawId);
      fillCourt(court);
      showDetails();
    } catch (error) {
      let message = 'Не удалось загрузить площадку. Проверьте соединение и повторите попытку.';

      if (error.status === 404) {
        message = 'Площадка не найдена или была удалена.';
      } else if (error.status === 400) {
        message = 'Некорректный идентификатор площадки.';
      }

      if (title) {
        title.textContent = 'Площадка не найдена';
      }
      document.title = 'Площадка не найдена — Street Spot';
      showState(message, true);
    }
  }

  loadCourt();
}

function initFormValidation() {
  const form = document.querySelector('.add-court-form');

  if (!form) {
    return;
  }

  const success = document.querySelector('.form-success');
  const serverError = document.querySelector('.form-server-error');
  const submitButton = form.querySelector('button[type="submit"]');
  const pageTitle = document.querySelector('#add-court-title');
  const pageBadge = document.querySelector('#add-court-badge');
  const resultTitle = document.querySelector('#new-court-result-title');
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const params = new URLSearchParams(window.location.search);
  const editId = params.get('id');
  const isEdit = Boolean(editId);

  const rules = {
    court_name: (value) => (value.trim().length >= 3 ? '' : 'Укажите название площадки (минимум 3 символа)'),
    court_address: (value) => (value.trim().length > 0 ? '' : 'Укажите адрес или ориентир')
  };

  if (!isEdit) {
    rules.court_contact = (value) => (emailPattern.test(value.trim()) ? '' : 'Введите корректный email');
    rules.court_description = (value) => (value.trim().length >= 20 ? '' : 'Описание должно содержать минимум 20 символов');
  }

  const serverFields = {
    name: { control: 'court_name', error: 'court-name' },
    address: { control: 'court_address', error: 'court-address' },
    surface: { control: 'surface', error: 'court-surface' },
    lighting: { control: 'lighting', error: 'court-lighting' },
    nets: { control: 'rings_net', error: 'court-nets' },
    rating: { control: 'rating', error: 'court-rating' },
    players: { control: 'players', error: 'court-players' }
  };

  function showError(field, message) {
    const errorElement = form.querySelector(`[data-error-for="${field.id}"]`);

    field.classList.toggle('input-error', Boolean(message));

    if (errorElement) {
      errorElement.textContent = message;
    }
  }

  function showServerError(controlName, errorFor, message) {
    form.querySelectorAll(`[name="${controlName}"]`).forEach((control) => {
      control.classList.toggle('input-error', Boolean(message));
    });

    const errorElement = form.querySelector(`[data-error-for="${errorFor}"]`);

    if (errorElement) {
      errorElement.textContent = message;
    }
  }

  function clearErrors() {
    form.querySelectorAll('.input-error').forEach((element) => element.classList.remove('input-error'));
    form.querySelectorAll('.field-error').forEach((element) => { element.textContent = ''; });

    if (serverError) {
      serverError.textContent = '';
      serverError.hidden = true;
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

  function buildPayload() {
    const surface = form.querySelector('input[name="surface"]:checked');
    const lighting = form.elements.lighting;
    const nets = form.elements.rings_net;

    return {
      name: form.elements.court_name.value.trim(),
      address: form.elements.court_address.value.trim(),
      surface: surface ? surface.value : '',
      lighting: Boolean(lighting && lighting.checked),
      nets: Boolean(nets && nets.checked)
    };
  }

  function fillForm(court) {
    const surfaceValues = {
      'Резина': 'rubber',
      'Асфальт': 'asphalt',
      'Паркет': 'parquet',
      rubber: 'rubber',
      asphalt: 'asphalt',
      parquet: 'parquet'
    };
    const surfaceValue = surfaceValues[court.surface] || 'rubber';
    const surfaceInput = form.querySelector(`input[name="surface"][value="${surfaceValue}"]`);

    form.elements.court_name.value = court.name || '';
    form.elements.court_address.value = court.address || '';

    if (form.elements.lighting) {
      form.elements.lighting.checked = Boolean(court.lighting);
    }
    if (form.elements.rings_net) {
      form.elements.rings_net.checked = Boolean(court.nets);
    }
    if (surfaceInput) {
      surfaceInput.checked = true;
    }
  }

  function renderCreatedCourt(court) {
    const resultBox = document.querySelector('#new-court-result');
    const resultList = document.querySelector('#new-court-list');

    if (!resultBox || !resultList || !court) {
      return;
    }

    if (resultTitle) {
      resultTitle.textContent = isEdit ? 'Обновлённая площадка' : 'Площадка в каталоге';
    }

    resultList.innerHTML = courtCardHtml(court);
    resultBox.hidden = false;
  }

  async function loadCourtForEdit() {
    if (!isEdit) {
      return;
    }

    if (typeof getCourtById !== 'function') {
      if (serverError) {
        serverError.textContent = 'Серверный API недоступен.';
        serverError.hidden = false;
      }
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Загрузка…';
    }

    try {
      const court = await getCourtById(editId);

      fillForm(court);

      if (pageTitle) {
        pageTitle.textContent = 'Редактировать площадку';
      }
      if (pageBadge) {
        pageBadge.textContent = 'Режим редактирования';
      }
      if (submitButton) {
        submitButton.textContent = 'Сохранить изменения';
      }

      document.title = 'Редактирование площадки — Street Spot';
    } catch (error) {
      if (serverError) {
        serverError.textContent = error.status === 404
          ? 'Площадка не найдена или была удалена.'
          : (error.message || 'Не удалось загрузить площадку.');
        serverError.hidden = false;
      }
      if (submitButton) {
        submitButton.textContent = 'Сохранить изменения';
      }
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  }

  Object.keys(rules).forEach((name) => {
    const field = form.elements[name];

    if (!field) {
      return;
    }

    field.addEventListener('input', () => validateField(field));
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    clearErrors();

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

    const saveCourt = isEdit ? updateCourt : createCourt;

    if (typeof saveCourt !== 'function') {
      if (serverError) {
        serverError.textContent = 'Серверный API недоступен.';
        serverError.hidden = false;
      }
      return;
    }

    const buttonText = submitButton ? submitButton.textContent : '';
    const pendingText = isEdit ? 'Сохранение…' : 'Отправка…';

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = pendingText;
    }

    try {
      const saved = isEdit
        ? await updateCourt(editId, buildPayload())
        : await createCourt(buildPayload());

      clearErrors();

      if (!isEdit) {
        form.reset();
      }

      if (success) {
        success.textContent = isEdit
          ? 'Изменения сохранены!'
          : 'Площадка успешно добавлена в каталог!';
        success.hidden = false;
      }

      renderCreatedCourt(saved);
    } catch (error) {
      if (error.fields) {
        Object.entries(error.fields).forEach(([field, message]) => {
          const target = serverFields[field];

          if (target) {
            showServerError(target.control, target.error, message);
          }
        });
      }

      if (serverError) {
        serverError.textContent = error.message
          || (isEdit ? 'Не удалось сохранить площадку.' : 'Не удалось добавить площадку.');
        serverError.hidden = false;
      }

      if (success) {
        success.hidden = true;
      }
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = buttonText;
      }
    }
  });

  loadCourtForEdit();
}

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initPlayersCounter();
  initModal();
  initAccordion();
  initCourtPage();
  initCatalog();
  initHomePage();
  initFormValidation();
});
