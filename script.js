const navLinks = [...document.querySelectorAll('.section-nav a')].filter(link =>
  link.pathname === location.pathname && link.hash && document.getElementById(link.hash.slice(1))
);
const sections = navLinks.map(link => document.getElementById(link.hash.slice(1)));
if (sections.length && navLinks.length) {
  const visible = new Set();
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target));
    const current = [...visible].sort((a, b) => b.getBoundingClientRect().top - a.getBoundingClientRect().top)[0];
    navLinks.forEach(link => {
      const active = Boolean(current && link.hash === `#${current.id}`);
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-15% 0px -60% 0px', threshold: 0 });
  sections.forEach(section => observer.observe(section));
}

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
if (!reducedMotion.matches && 'IntersectionObserver' in window) {
  const reveal = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      reveal.unobserve(entry.target);
    });
  }, { threshold: 0, rootMargin: '0px 0px -30px 0px' });
  document.querySelectorAll('[data-reveal]').forEach(element => {
    element.classList.add('reveal-ready');
    reveal.observe(element);
  });
}

const copyEmail = document.querySelector('[data-copy-email]');
copyEmail?.addEventListener('click', async () => {
  const status = document.querySelector('.copy-status');
  try {
    await navigator.clipboard.writeText(copyEmail.dataset.copyEmail);
    status.textContent = '邮箱已复制';
  } catch {
    status.textContent = '复制未成功，请直接选中邮箱地址。';
  }
});

if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
  let frame = 0;
  let x = 0;
  let y = 0;
  const glow = document.body;

  window.addEventListener('pointermove', event => {
    if (reducedMotion.matches || event.pointerType === 'touch') return;
    x = event.clientX;
    y = event.clientY;
    if (frame) return;
    frame = requestAnimationFrame(() => {
      glow.style.setProperty('--pointer-x', `${x}px`);
      glow.style.setProperty('--pointer-y', `${y}px`);
      glow.classList.add('pointer-glow-active');
      frame = 0;
    });
  }, { passive: true });

  const clearGlow = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    glow.classList.remove('pointer-glow-active');
  };
  window.addEventListener('pointerleave', clearGlow);
  reducedMotion.addEventListener('change', event => {
    if (event.matches) clearGlow();
  });
}
