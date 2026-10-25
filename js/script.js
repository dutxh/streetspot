'use strict';

console.log('Street Spot: скрипты подключены');

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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

const courts = [
  { id: 1, name: 'Корт в парке Павлика Морозова', address: 'ул. Декабристов, 16/18г', surface: 'Резина', lighting: true, nets: true, favorite: false },
  { id: 2, name: 'Площадка на Набережной', address: 'ул. Горького, 4а', surface: 'Резина', lighting: true, nets: true, favorite: false },
  { id: 3, name: 'Корт в парке Маяковского', address: 'ул. Мичурина, 230', surface: 'Асфальт', lighting: false, nets: true, favorite: false },
  { id: 4, name: 'Дворовый корт на Мира', address: 'ул. Мира, 19', surface: 'Асфальт', lighting: false, nets: true, favorite: false },
  { id: 5, name: 'Корт СК «Юность»', address: 'ул. Еремина, 12', surface: 'Паркет', lighting: true, nets: true, favorite: false },
  { id: 6, name: 'Стритбольная клетка на Радищева', address: 'ул. Радищева, 33', surface: 'Резина', lighting: true, nets: false, favorite: false },
  { id: 7, name: 'Площадка стадиона «Динамо»', address: 'ул. Ельцина, 8', surface: 'Асфальт', lighting: true, nets: true, favorite: false },
  { id: 8, name: 'Корт на 8 Марта', address: 'ул. 8 Марта, 62', surface: 'Резина', lighting: true, nets: true, favorite: true },
  { id: 9, name: 'Корт в парке УрГУПС', address: 'ул. Дзержинского, 14', surface: 'Асфальт', lighting: false, nets: false, favorite: false }
];

function initCatalog() {
  const list = document.querySelector('#courts-list');
  const empty = document.querySelector('.catalog-empty');
  const search = document.querySelector('.catalog-query');

  if (!list) {
    return;
  }

  function buildCard(court) {
    const features = [court.surface];
    if (court.lighting) {
      features.push('Освещение');
    }
    if (court.nets) {
      features.push('Сетки');
    }

    const activeClass = court.favorite ? ' active' : '';
    const pressed = String(court.favorite);

    return `
      <article class="court-card" data-id="${court.id}">
        <h2 class="court-card-title">${escapeHtml(court.name)}</h2>
        <p class="court-card-desc">${escapeHtml(court.address)} • ${escapeHtml(features.join(' • '))}</p>
        <div class="court-card-actions">
          <a href="court.html" class="btn btn-secondary">Подробнее</a>
          <button type="button" class="favorite-btn${activeClass}" aria-pressed="${pressed}" aria-label="Добавить в избранное">&hearts;</button>
        </div>
      </article>
    `;
  }

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

    list.innerHTML = items.map(buildCard).join('');
  }

  list.addEventListener('click', (event) => {
    const button = event.target.closest('.favorite-btn');

    if (!button) {
      return;
    }

    const card = button.closest('.court-card');
    const court = courts.find((item) => item.id === Number(card.dataset.id));

    if (!court) {
      return;
    }

    court.favorite = !court.favorite;
    button.classList.toggle('active', court.favorite);
    button.setAttribute('aria-pressed', String(court.favorite));
  });

  if (search) {
    search.addEventListener('input', () => {
      const query = search.value.trim().toLowerCase();

      const filtered = courts.filter((court) => {
        return court.name.toLowerCase().includes(query)
          || court.address.toLowerCase().includes(query);
      });

      renderCourts(filtered);
    });
  }

  renderCourts(courts);
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
  initFormValidation();
});
