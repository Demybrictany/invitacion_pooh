const revealItems = document.querySelectorAll('.reveal');
const animatedSections = document.querySelectorAll('.section-animate');

const backgroundMusic = document.querySelector('.background-music');
const musicToggle = document.querySelector('.music-toggle');
const locationVideo = document.querySelector('.location-video video');
const soundToggle = document.querySelector('.sound-toggle');
const resultsEndpoint = 'https://docs.google.com/spreadsheets/d/1fD0eW6Y8T4xXm9pF8fhXI0XHGnK_0C1yJJ1CYlud23E/gviz/tq?tqx=out:json;responseHandler:handleSheetResponse';

backgroundMusic.volume = 1;

async function startMusic() {
  backgroundMusic.muted = false;
  try {
    await backgroundMusic.play();
    updateMusicToggle(true);
  } catch (error) {
    // El navegador puede bloquear el sonido hasta la primera interacción.
    musicToggle.classList.add('is-playing');
  }
}

function updateMusicToggle(isPlaying) {
  const isAudible = isPlaying && !backgroundMusic.muted;
  musicToggle.setAttribute('aria-label', isAudible ? 'Silenciar música' : 'Activar música');
  musicToggle.setAttribute('aria-pressed', String(isAudible));
  musicToggle.setAttribute('title', isAudible ? 'Silenciar música' : 'Activar música');
  musicToggle.classList.toggle('is-playing', isAudible);
  musicToggle.querySelector('.music-icon').textContent = isAudible ? '♫' : '×';
}

musicToggle.addEventListener('click', async () => {
  if (backgroundMusic.paused) {
    await startMusic();
    return;
  }

  backgroundMusic.muted = !backgroundMusic.muted;
  updateMusicToggle(true);
});

backgroundMusic.addEventListener('play', () => updateMusicToggle(true));
backgroundMusic.addEventListener('pause', () => updateMusicToggle(false));
backgroundMusic.addEventListener('error', () => updateMusicToggle(false));
startMusic();

document.addEventListener('pointerdown', (event) => {
  if (!event.target.closest('.music-toggle') && backgroundMusic.paused) startMusic();
}, { capture: true, once: true });

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Tab' && backgroundMusic.paused) startMusic();
}, { once: true });

soundToggle.addEventListener('click', async () => {
  locationVideo.muted = false;
  locationVideo.volume = 1;
  soundToggle.textContent = 'Sonido activado';
  soundToggle.classList.add('is-active');
  try {
    await locationVideo.play();
  } catch (error) {
    soundToggle.textContent = 'Toca el video para reproducir';
  }
});

function updateLiveResults(votes) {
  const total = votes.boy + votes.girl;
  const percentages = {
    boy: total ? Math.round((votes.boy / total) * 100) : 0,
    girl: total ? Math.round((votes.girl / total) * 100) : 0
  };

  ['boy', 'girl'].forEach((choice) => {
    document.querySelector(`[data-stat-percent="${choice}"]`).textContent = `${percentages[choice]}%`;
    document.querySelector(`[data-stat-fill="${choice}"]`).style.width = `${percentages[choice]}%`;
    document.querySelector(`[data-stat-count="${choice}"]`).textContent = `${votes[choice]} ${votes[choice] === 1 ? 'voto' : 'votos'}`;
  });

  document.querySelector('[data-stat-total]').textContent = `${total} ${total === 1 ? 'voto registrado' : 'votos registrados'}`;
}

function showResultsError() {
  const status = document.querySelector('[data-stat-total]');
  status.textContent = 'No se pudieron cargar los resultados.';
}

window.handleSheetResponse = (data) => {
  try {
    const votes = { boy: 0, girl: 0 };

    data.table.rows.forEach((row) => {
      const answer = String(row.c?.[1]?.v || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (answer.includes('nino')) votes.boy += 1;
      if (answer.includes('nina')) votes.girl += 1;
    });

    updateLiveResults(votes);
  } catch (error) {
    showResultsError();
  }
};

const resultsScript = document.createElement('script');
resultsScript.src = resultsEndpoint;
resultsScript.onerror = showResultsError;
document.body.appendChild(resultsScript);

const revealOnScroll = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealItems.forEach((item) => revealOnScroll.observe(item));
animatedSections.forEach((section) => revealOnScroll.observe(section));
