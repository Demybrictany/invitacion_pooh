const revealItems = document.querySelectorAll('.reveal');
const animatedSections = document.querySelectorAll('.section-animate');

const voteKey = 'revelacion-jose-jisel-votes';
const savedVotes = JSON.parse(localStorage.getItem(voteKey) || '{"boy":0,"girl":0}');
const voteButtons = document.querySelectorAll('[data-vote]');
const locationVideo = document.querySelector('.location-video video');
const soundToggle = document.querySelector('.sound-toggle');

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

function renderVotes() {
  const total = savedVotes.boy + savedVotes.girl;
  const labels = {
    boy: total ? Math.round((savedVotes.boy / total) * 100) : 0,
    girl: total ? Math.round((savedVotes.girl / total) * 100) : 0
  };

  ['boy', 'girl'].forEach((choice) => {
    document.querySelector(`[data-result-label="${choice}"]`).textContent = `${labels[choice]}%`;
    document.querySelector(`[data-result-fill="${choice}"]`).style.width = `${labels[choice]}%`;
  });

  document.querySelector('[data-vote-total]').textContent = `${total} ${total === 1 ? 'voto' : 'votos'}`;
  document.querySelector('.vote-status').textContent = total
    ? `Va ganando ${savedVotes.boy === savedVotes.girl ? 'el empate' : savedVotes.boy > savedVotes.girl ? 'niño' : 'niña'} con ${Math.max(labels.boy, labels.girl)}%.`
    : 'Aún no hay votos. ¡Sé el primero!';
}

voteButtons.forEach((button) => {
  button.addEventListener('click', () => {
    savedVotes[button.dataset.vote] += 1;
    localStorage.setItem(voteKey, JSON.stringify(savedVotes));
    renderVotes();
    voteButtons.forEach((item) => { item.disabled = true; });
    button.textContent = '¡Voto registrado!';
  });
});

renderVotes();

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
