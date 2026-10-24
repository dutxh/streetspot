
const playersList = document.querySelector('.players-list');
const playersCount = document.querySelector('.players-count');

function updatePlayersCount() {
  if (!playersList || !playersCount) {
    return;
  }

  const total = playersList.querySelectorAll('.player-item').length;
  playersCount.textContent = total;
}

function animatePlayersCount() {
  if (!playersList || !playersCount) {
    return;
  }

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

const joinButton = document.querySelector('.join-btn');

function toggleJoinState() {
  if (!joinButton || !playersList) {
    return;
  }

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

document.addEventListener('DOMContentLoaded', () => {
  animatePlayersCount();

  if (joinButton) {
    joinButton.addEventListener('click', toggleJoinState);
  }
});
