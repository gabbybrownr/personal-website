const menuButton = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
const revealSections = document.querySelectorAll('.section-reveal');
const metricNodes = document.querySelectorAll('.metric[data-target]');
const navLinks = document.querySelectorAll('.site-nav a[href^="#"]');
const collageTrack = document.querySelector('.collage-track');
const collageViewport = document.querySelector('.collage-viewport');
const sliderPrev = document.querySelector('.slider-prev');
const sliderNext = document.querySelector('.slider-next');

if (menuButton && siteNav) {
  menuButton.addEventListener('click', () => {
    const expanded = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!expanded));
    siteNav.classList.toggle('open');
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      menuButton.setAttribute('aria-expanded', 'false');
      siteNav.classList.remove('open');
    });
  });
}

if (collageTrack && sliderPrev && sliderNext) {
  const slides = Array.from(collageTrack.querySelectorAll('.collage-card'));
  let activeSlide = 0;
  let touchStartX = 0;

  function showSlide(index) {
    activeSlide = (index + slides.length) % slides.length;
    collageTrack.style.transform = `translateX(-${activeSlide * 100}%)`;
  }

  sliderPrev.addEventListener('click', () => {
    showSlide(activeSlide - 1);
  });

  sliderNext.addEventListener('click', () => {
    showSlide(activeSlide + 1);
  });

  if (collageViewport) {
    collageViewport.addEventListener(
      'touchstart',
      (event) => {
        touchStartX = event.changedTouches[0].clientX;
      },
      { passive: true }
    );

    collageViewport.addEventListener(
      'touchend',
      (event) => {
        const touchEndX = event.changedTouches[0].clientX;
        const deltaX = touchEndX - touchStartX;
        if (Math.abs(deltaX) < 40) {
          return;
        }
        if (deltaX < 0) {
          showSlide(activeSlide + 1);
        } else {
          showSlide(activeSlide - 1);
        }
      },
      { passive: true }
    );
  }

  showSlide(0);
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  },
  { threshold: 0.16 }
);

revealSections.forEach((section) => revealObserver.observe(section));

function formatMetricValue(value) {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M+`;
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K+`;
  }

  return `${value}+`;
}

function animateMetric(node) {
  const target = Number(node.getAttribute('data-target') || '0');
  if (!target) {
    return;
  }

  const duration = 1200;
  const step = Math.max(1, Math.floor(target / 80));
  let value = 0;

  const timer = window.setInterval(() => {
    value += step;
    if (value >= target) {
      value = target;
      window.clearInterval(timer);
    }
    node.textContent = formatMetricValue(value);
  }, Math.max(12, Math.floor(duration / 80)));
}

const metricObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }
      animateMetric(entry.target);
      metricObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.5 }
);

metricNodes.forEach((node) => metricObserver.observe(node));

const sections = Array.from(document.querySelectorAll('main section[id]'));

function updateActiveNav() {
  const y = window.scrollY + 120;
  let current = '';

  sections.forEach((section) => {
    if (y >= section.offsetTop) {
      current = section.id;
    }
  });

  navLinks.forEach((link) => {
    const isActive = link.getAttribute('href') === `#${current}`;
    link.classList.toggle('active', isActive);
  });
}

window.addEventListener('scroll', updateActiveNav, { passive: true });
updateActiveNav();
