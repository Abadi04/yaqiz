// ─── Visual Enhancements Module ───
// 1. Particle Background (Hero)
// 2. Animated Count-Up Numbers on Scroll
// 3. 3D Flip Animation on Puzzle Cards
// 4. Custom Cursor

const Enhancements = (() => {
  // ━━━━━ 1. PARTICLE BACKGROUND ━━━━━
  function initParticles() {
    // Only run on home page when hero exists
    const hero = document.querySelector('.hero');
    if (!hero) return;

    // Remove existing canvas if re-rendered
    const existing = hero.querySelector('.particles-canvas');
    if (existing) existing.remove();

    const canvas = document.createElement('canvas');
    canvas.classList.add('particles-canvas');
    hero.insertBefore(canvas, hero.firstChild);

    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: null, y: null };
    let animFrame;

    function resize() {
      canvas.width = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });

    hero.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.baseSpeedX = (Math.random() - 0.5) * 0.5;
        this.baseSpeedY = (Math.random() - 0.5) * 0.5;
        this.speedX = this.baseSpeedX;
        this.speedY = this.baseSpeedY;
        // Light purple + white palette
        const colors = [
          'rgba(139, 92, 246, 0.4)',   // Purple
          'rgba(167, 139, 250, 0.35)', // Light purple
          'rgba(196, 181, 253, 0.3)',  // Lighter purple
          'rgba(221, 214, 254, 0.25)', // Very light purple
          'rgba(255, 255, 255, 0.3)',  // White
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.opacity = Math.random() * 0.5 + 0.2;
      }
      update() {
        // Mouse interaction
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            const force = (150 - dist) / 150;
            this.speedX = this.baseSpeedX - (dx / dist) * force * 1.2;
            this.speedY = this.baseSpeedY - (dy / dist) * force * 1.2;
          } else {
            this.speedX += (this.baseSpeedX - this.speedX) * 0.05;
            this.speedY += (this.baseSpeedY - this.speedY) * 0.05;
          }
        } else {
          this.speedX += (this.baseSpeedX - this.speedX) * 0.05;
          this.speedY += (this.baseSpeedY - this.speedY) * 0.05;
        }

        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around
        if (this.x < -10) this.x = canvas.width + 10;
        if (this.x > canvas.width + 10) this.x = -10;
        if (this.y < -10) this.y = canvas.height + 10;
        if (this.y > canvas.height + 10) this.y = -10;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    // Determine particle count based on screen size
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 30 : 60;
    particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function drawLines() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(167, 139, 250, ${0.1 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      drawLines();
      animFrame = requestAnimationFrame(animate);
    }
    animate();

    // Store cleanup ref
    hero._particlesCleanup = () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', resize);
    };
  }

  // ━━━━━ 2. ANIMATED COUNT-UP NUMBERS ON SCROLL ━━━━━
  function initCountUp() {
    const heroStats = document.querySelector('.hero-stats');
    if (!heroStats) return;
    // Skip if already initialized on this DOM node
    if (heroStats.dataset.countupInit) return;
    heroStats.dataset.countupInit = 'true';

    const statSpans = heroStats.querySelectorAll('span');
    if (!statSpans.length) return;

    // Parse the stat data from original text
    const statData = [];
    statSpans.forEach((span) => {
      const text = span.textContent;
      // Match Arabic numerals followed by optional +
      const arabicMatch = text.match(/([٠-٩]+)\+?/);

      if (arabicMatch) {
        // Convert Arabic numerals to English for counting
        const arabicDigits = '٠١٢٣٤٥٦٧٨٩';
        const num = parseInt(arabicMatch[1].split('').map(d => arabicDigits.indexOf(d)).join(''));
        const hasPlus = text.includes('+');

        // Split text around the number+plus
        const matchIndex = text.indexOf(arabicMatch[0]);
        const prefix = text.substring(0, matchIndex);
        const matchLength = arabicMatch[0].length;
        const suffix = text.substring(matchIndex + matchLength);

        statData.push({
          element: span,
          targetNum: num,
          hasPlus,
          prefix,
          suffix,
          counted: false
        });

        // Set initial state to 0
        span.textContent = `${prefix}${toArabicNum(0)}${hasPlus ? '+' : ''}${suffix}`;
      }
    });

    if (!statData.length) return;

    // Intersection Observer to trigger count-up on scroll
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          statData.forEach(data => {
            if (!data.counted) {
              data.counted = true;
              animateCount(data);
            }
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    observer.observe(heroStats);
  }

  function toArabicNum(num) {
    const arabicDigits = '٠١٢٣٤٥٦٧٨٩';
    return num.toString().split('').map(d => arabicDigits[parseInt(d)]).join('');
  }

  function animateCount(data) {
    const duration = 2000;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentNum = Math.round(eased * data.targetNum);

      const displayNum = toArabicNum(currentNum);
      data.element.textContent = `${data.prefix}${displayNum}${data.hasPlus ? '+' : ''}${data.suffix}`;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }
    requestAnimationFrame(update);
  }

  // ━━━━━ 3. 3D FLIP ANIMATION ON PUZZLE CARDS ━━━━━
  function initFlipCards() {
    const puzzleCards = document.querySelectorAll('.puzzle-card');
    if (!puzzleCards.length) return;

    puzzleCards.forEach(card => {
      // Skip locked cards
      if (card.classList.contains('locked')) return;
      // Skip if already transformed
      if (card.querySelector('.flip-card-inner')) return;

      // Get the puzzle data from the onclick
      const onclickAttr = card.getAttribute('onclick');
      if (!onclickAttr) return;
      const idMatch = onclickAttr.match(/puzzle\/(\d+)/);
      if (!idMatch) return;
      const puzzleId = parseInt(idMatch[1]);
      const puzzle = PUZZLES.find(p => p.id === puzzleId);
      if (!puzzle) return;

      // Store original content
      const originalContent = card.innerHTML;

      // Create flip structure
      card.innerHTML = '';
      card.classList.add('flip-card');

      const inner = document.createElement('div');
      inner.classList.add('flip-card-inner');

      // Front face - original content
      const front = document.createElement('div');
      front.classList.add('flip-card-front');
      front.innerHTML = originalContent;

      // Back face - hint/info
      const back = document.createElement('div');
      back.classList.add('flip-card-back');
      back.innerHTML = `
        <div class="flip-back-content">
          <div class="flip-back-icon">${puzzle.catIcon}</div>
          <h3 class="flip-back-title">${puzzle.title}</h3>
          <div class="flip-back-divider"></div>
          <p class="flip-back-label">💡 تلميح</p>
          <p class="flip-back-hint">${puzzle.hints ? puzzle.hints[0] : 'فكّر خارج الصندوق!'}</p>
          <div class="flip-back-meta">
            <span>🏆 ${puzzle.points} نقطة</span>
            <span>📂 ${puzzle.category}</span>
          </div>
          <p class="flip-back-benefit">${puzzle.cognitiveBenefit || ''}</p>
        </div>
      `;

      inner.appendChild(front);
      inner.appendChild(back);
      card.appendChild(inner);

      // Preserve original click navigation
      card.removeAttribute('onclick');
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      if (isTouchDevice) {
        // Mobile: first tap flips, second tap navigates
        card.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (card.classList.contains('flipped')) {
            // Second tap — navigate
            window.location.hash = `#/puzzle/${puzzleId}`;
          } else {
            // First tap — flip
            // Unflip all other cards
            document.querySelectorAll('.flip-card.flipped').forEach(c => c.classList.remove('flipped'));
            card.classList.add('flipped');
          }
        });
      } else {
        // Desktop: hover flips, click navigates
        card.addEventListener('click', (e) => {
          window.location.hash = `#/puzzle/${puzzleId}`;
        });
      }
    });
  }

  // ━━━━━ 4. CUSTOM CURSOR ━━━━━
  let cursorEl, cursorDot;
  function initCustomCursor() {
    // Don't show on touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

    // Remove existing cursor if re-init
    const existing = document.querySelector('.custom-cursor');
    if (existing) existing.remove();
    const existingDot = document.querySelector('.custom-cursor-dot');
    if (existingDot) existingDot.remove();

    // Create cursor elements
    cursorEl = document.createElement('div');
    cursorEl.classList.add('custom-cursor');
    document.body.appendChild(cursorEl);

    cursorDot = document.createElement('div');
    cursorDot.classList.add('custom-cursor-dot');
    document.body.appendChild(cursorDot);

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      // Dot follows immediately
      cursorDot.style.left = mouseX + 'px';
      cursorDot.style.top = mouseY + 'px';
    });

    // Smooth follow for the glow circle
    function followCursor() {
      cursorX += (mouseX - cursorX) * 0.15;
      cursorY += (mouseY - cursorY) * 0.15;
      cursorEl.style.left = cursorX + 'px';
      cursorEl.style.top = cursorY + 'px';
      requestAnimationFrame(followCursor);
    }
    followCursor();

    // Scale up on interactive elements
    const hoverTargets = 'a, button, .btn, .puzzle-card, .category-card, .choice-btn, .color-btn, .shape-item, input, .share-btn, .price-card, .nav-logo';

    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverTargets)) {
        cursorEl.classList.add('cursor-hover');
        cursorDot.classList.add('cursor-hover');
      }
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverTargets)) {
        cursorEl.classList.remove('cursor-hover');
        cursorDot.classList.remove('cursor-hover');
      }
    });

    // Hide on mouse leave window
    document.addEventListener('mouseleave', () => {
      cursorEl.style.opacity = '0';
      cursorDot.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      cursorEl.style.opacity = '1';
      cursorDot.style.opacity = '1';
    });
  }

  // ━━━━━ INIT ON ROUTE CHANGE ━━━━━
  function onRouteChange() {
    // Small delay to let DOM render
    requestAnimationFrame(() => {
      setTimeout(() => {
        initParticles();
        initCountUp();
        initFlipCards();
      }, 50);
    });
  }

  function init() {
    initCustomCursor();
    onRouteChange();

    // Re-init on hash change (SPA routing)
    window.addEventListener('hashchange', () => {
      setTimeout(onRouteChange, 100);
    });
  }

  return { init, onRouteChange };
})();
