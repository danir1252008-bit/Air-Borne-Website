document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  const TOTAL_FRAMES = 222;
  const images = [];
  let loadedCount = 0;
  
  // DOM Elements
  const preloader = document.getElementById('preloader');
  const loaderBar = document.getElementById('loader-bar');
  const loaderStatus = document.getElementById('loader-status');
  
  const canvas = document.getElementById('hero-canvas');
  const ctx = canvas.getContext('2d');
  
  const hudFrameNum = document.getElementById('hud-frame-num');
  const hudProgressFill = document.getElementById('hud-progress-fill');
  const btnPlayPause = document.getElementById('btn-play-pause');
  const iconPlayPause = document.getElementById('icon-play-pause');
  const btnScrollTop = document.getElementById('btn-scroll-top');

  // Animation State
  let currentFrame = 0;
  let targetFrame = 0;
  let lastRenderedFrame = -1;
  let isAutoPlaying = false;
  let autoPlayRafId = null;

  // Cached Layout Metrics to prevent layout thrashing
  let cachedViewportWidth = window.innerWidth;
  let cachedViewportHeight = window.innerHeight;
  let cachedContainerTop = 0;
  let cachedContainerHeight = 1;
  let cachedLeftHeight = 220;
  let cachedRightHeight = 130;
  let cachedRightWidth = 380;

  function updateMetrics() {
    cachedViewportWidth = window.innerWidth;
    cachedViewportHeight = window.innerHeight;

    const scrollContainer = document.querySelector('.scroll-container');
    if (scrollContainer) {
      cachedContainerTop = scrollContainer.offsetTop;
      cachedContainerHeight = Math.max(1, scrollContainer.offsetHeight - cachedViewportHeight);
    }

    const leftCard = document.getElementById('hero-left-card');
    const rightCard = document.getElementById('hero-right-card');
    if (leftCard) cachedLeftHeight = leftCard.offsetHeight || 220;
    if (rightCard) {
      cachedRightHeight = rightCard.offsetHeight || 130;
      cachedRightWidth = rightCard.offsetWidth || 380;
    }
  }

  // Setup Canvas Size & Resize Handler
  function resizeCanvas() {
    updateMetrics();
    const isMobile = cachedViewportWidth < 768;
    const dpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.floor(cachedViewportWidth * dpr);
    canvas.height = Math.floor(cachedViewportHeight * dpr);
    ctx.scale(dpr, dpr);
    
    lastRenderedFrame = -1;
    renderCanvas(Math.round(currentFrame));
  }

  window.addEventListener('resize', resizeCanvas);

  // Render Image Frame to Canvas with Cover Aspect Ratio
  function renderCanvas(index) {
    const img = images[index];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const viewportWidth = cachedViewportWidth;
    const viewportHeight = cachedViewportHeight;

    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;

    const imgAspect = imgWidth / imgHeight;
    const viewportAspect = viewportWidth / viewportHeight;

    let drawWidth, drawHeight;

    if (viewportAspect > imgAspect) {
      drawWidth = viewportWidth;
      drawHeight = viewportWidth / imgAspect;
    } else {
      drawHeight = viewportHeight;
      drawWidth = viewportHeight * imgAspect;
    }

    const offsetX = (viewportWidth - drawWidth) / 2;
    const offsetY = (viewportHeight - drawHeight) / 2;

    ctx.clearRect(0, 0, viewportWidth, viewportHeight);
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  }

  // Preload Image Sequence
  function preloadImages() {
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      const frameNumStr = String(i).padStart(3, '0');
      img.src = `ezgif-frame-${frameNumStr}.png`;

      img.onload = () => {
        loadedCount++;
        if (i === 1) {
          resizeCanvas();
          renderCanvas(0);
        }
      };

      img.onerror = () => {
        loadedCount++;
      };

      images.push(img);
    }
  }

  // Start Canvas & Animation Loop Immediately
  updateMetrics();
  resizeCanvas();
  requestAnimationFrame(animationLoop);

  // Calculate target frame index from scroll position
  function updateScrollTarget() {
    if (cachedContainerHeight <= 0) return;
    const scrollTop = window.scrollY - cachedContainerTop;
    const scrollFraction = Math.max(0, Math.min(1, scrollTop / cachedContainerHeight));
    targetFrame = scrollFraction * (TOTAL_FRAMES - 1);
  }

  window.addEventListener('scroll', updateScrollTarget, { passive: true });

  // Update Dual Hero Overlay Cards
  function updateHeroOverlay() {
    const leftCard = document.getElementById('hero-left-card');
    const rightCard = document.getElementById('hero-right-card');
    if (!leftCard || !rightCard || cachedContainerHeight <= 0) return;

    const scrollTop = window.scrollY - cachedContainerTop;
    const scrollFraction = Math.max(0, Math.min(1, scrollTop / cachedContainerHeight));

    const DOCK_THRESHOLD = 0.28;
    const progress = Math.min(1, Math.max(0, scrollFraction / DOCK_THRESHOLD));
    const easeProgress = 1 - Math.pow(1 - progress, 3);

    const isMobile = cachedViewportWidth < 768;
    const GAP = isMobile ? 16 : 40;

    const centerX = cachedViewportWidth / 2;
    const centerY = cachedViewportHeight / 2;

    // --- LEFT CARD ---
    const leftCardHeight = cachedLeftHeight;
    const leftStartX = centerX;
    const leftStartY = isMobile ? (centerY - 120) : (centerY - 110);

    const leftEndX = GAP;
    const leftEndY = cachedViewportHeight - leftCardHeight - GAP;

    const leftCurrentX = leftStartX + (leftEndX - leftStartX) * easeProgress;
    const leftCurrentY = leftStartY + (leftEndY - leftStartY) * easeProgress;

    const leftTranslateX = -50 * (1 - easeProgress);
    const leftTranslateY = -50 * (1 - easeProgress);

    leftCard.style.left = `${leftCurrentX.toFixed(1)}px`;
    leftCard.style.top = `${leftCurrentY.toFixed(1)}px`;
    leftCard.style.transform = `translate(${leftTranslateX.toFixed(1)}%, ${leftTranslateY.toFixed(1)}%) translateZ(0)`;

    // --- RIGHT CARD ---
    const rightCardHeight = cachedRightHeight;
    const rightCardWidth = cachedRightWidth;

    const rightStartX = centerX;
    const rightStartY = isMobile ? (centerY + leftCardHeight / 2 + 30) : (centerY + leftCardHeight / 2 + 25);

    const rightEndX = cachedViewportWidth - rightCardWidth - GAP;
    const rightEndY = cachedViewportHeight - rightCardHeight - GAP;

    const rightCurrentX = rightStartX + (rightEndX - rightStartX) * easeProgress;
    const rightCurrentY = rightStartY + (rightEndY - rightStartY) * easeProgress;

    const rightTranslateX = -50 * (1 - easeProgress);
    const rightTranslateY = -50 * (1 - easeProgress);

    rightCard.style.left = `${rightCurrentX.toFixed(1)}px`;
    rightCard.style.top = `${rightCurrentY.toFixed(1)}px`;
    rightCard.style.transform = `translate(${rightTranslateX.toFixed(1)}%, ${rightTranslateY.toFixed(1)}%) translateZ(0)`;

    // Toggle frosted glass effect cards
    if (progress > 0.12) {
      leftCard.classList.add('glass-docked');
      rightCard.classList.add('glass-docked');
    } else {
      leftCard.classList.remove('glass-docked');
      rightCard.classList.remove('glass-docked');
    }
  }

  // Main Render Loop with Frame Lerping
  function animationLoop() {
    if (!isAutoPlaying) {
      updateScrollTarget();
    }

    updateHeroOverlay();

    // Lerp smooth movement towards target frame (balanced responsive lerp)
    const isMobile = cachedViewportWidth < 768;
    const lerpSpeed = isMobile ? 0.35 : 0.25;
    const delta = (targetFrame - currentFrame) * lerpSpeed;
    currentFrame += delta;

    const roundedFrame = Math.round(currentFrame);
    const clampedFrame = Math.max(0, Math.min(TOTAL_FRAMES - 1, roundedFrame));

    // Only redraw canvas when frame actually changes
    if (clampedFrame !== lastRenderedFrame) {
      renderCanvas(clampedFrame);
      lastRenderedFrame = clampedFrame;

      // Update HUD
      const hudFrameStr = String(clampedFrame + 1).padStart(3, '0');
      if (hudFrameNum) hudFrameNum.innerText = hudFrameStr;

      const progressPercent = (clampedFrame / (TOTAL_FRAMES - 1)) * 100;
      if (hudProgressFill) hudProgressFill.style.width = `${progressPercent}%`;
    }

    requestAnimationFrame(animationLoop);
  }

  // Auto-play Toggle
  function toggleAutoPlay() {
    isAutoPlaying = !isAutoPlaying;
    
    if (isAutoPlaying) {
      if (iconPlayPause) iconPlayPause.setAttribute('data-lucide', 'pause');
      autoPlayStep();
    } else {
      if (iconPlayPause) iconPlayPause.setAttribute('data-lucide', 'play');
      if (autoPlayRafId) cancelAnimationFrame(autoPlayRafId);
    }
    if (window.lucide) window.lucide.createIcons();
  }

  function autoPlayStep() {
    if (!isAutoPlaying) return;

    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    let nextScroll = window.scrollY + 5;
    
    if (nextScroll >= maxScroll) {
      nextScroll = 0;
    }

    window.scrollTo({ top: nextScroll, behavior: 'instant' });
    autoPlayRafId = requestAnimationFrame(autoPlayStep);
  }

  if (btnPlayPause) {
    btnPlayPause.addEventListener('click', toggleAutoPlay);
  }

  if (btnScrollTop) {
    btnScrollTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // Smooth scroll handler for nav menu links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();

        if (mobileMenu) mobileMenu.classList.add('hidden');

        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Highlight active nav menu link on scroll
  const navMenuLinks = document.querySelectorAll('.nav-menu-link');
  const trackSections = [
    document.getElementById('home'),
    document.getElementById('trusted'),
    document.getElementById('portfolio'),
    document.getElementById('contact')
  ].filter(Boolean);

  window.addEventListener('scroll', () => {
    let currentId = 'home';
    const scrollPos = window.scrollY + window.innerHeight * 0.35;

    trackSections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = sec.getAttribute('id');
      }
    });

    navMenuLinks.forEach(link => {
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('text-primary', 'border-b-2', 'border-primary');
        link.classList.remove('text-on-surface-variant');
      } else {
        link.classList.remove('text-primary', 'border-b-2', 'border-primary');
        link.classList.add('text-on-surface-variant');
      }
    });
  });

  // Intersection Observer for imported section reveal animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, observerOptions);

  // Start Preloading
  preloadImages();
});
