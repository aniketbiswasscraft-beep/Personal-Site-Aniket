/* MASTER INTERACTION ENGINE — ANIKET BISWAS PERSONAL SITE */

document.addEventListener('DOMContentLoaded', () => {
  initAmbientParticles();
  initCursorGlow();
  initNumbersWall();
  initJourneyTimeline();
  initRevenueEngine();
  initBentoSpots();
});

/* 1. AMBIENT DUST SIMULATION (2D Canvas) */
function initAmbientParticles() {
  const canvas = document.getElementById('ambient-particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let particles = [];
  const particleCount = 60;
  
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  
  class Particle {
    constructor() {
      this.reset();
      this.y = Math.random() * canvas.height; // Spread initially
    }
    
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = canvas.height + 10;
      this.size = Math.random() * 1.5 + 0.5;
      this.speedY = Math.random() * 0.4 + 0.1;
      this.speedX = (Math.random() - 0.5) * 0.15;
      this.alpha = Math.random() * 0.4 + 0.15;
      this.fadeSpeed = 0.002;
    }
    
    update() {
      this.y -= this.speedY;
      this.x += this.speedX;
      
      // Horizontal bounds bounce
      if (this.x < 0 || this.x > canvas.width) {
        this.speedX = -this.speedX;
      }
      
      // Reset if out of screen
      if (this.y < -10) {
        this.reset();
      }
    }
    
    draw() {
      ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // Populate particles
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }
  
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let p of particles) {
      p.update();
      p.draw();
    }
    requestAnimationFrame(animate);
  }
  
  animate();
}

/* 2. DYNAMIC CURSOR GLOW (Follows cursor with slight ease) */
function initCursorGlow() {
  const glow = document.getElementById('cursor-glow');
  if (!glow) return;
  
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  const ease = 0.08;
  
  window.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    glow.style.opacity = '1';
  });
  
  window.addEventListener('mouseout', () => {
    glow.style.opacity = '0';
  });
  
  function tick() {
    currentX += (targetX - currentX) * ease;
    currentY += (targetY - currentY) * ease;
    glow.style.left = `${currentX}px`;
    glow.style.top = `${currentY}px`;
    requestAnimationFrame(tick);
  }
  tick();
}

/* 3. NUMBERS WALL SCROLL PINNING & CROSS-FADE */
function initNumbersWall() {
  const wallTracker = document.getElementById('numbers-wall');
  const fillBar = document.getElementById('numbers-progress-fill');
  const slides = document.querySelectorAll('.num-slide');
  if (!wallTracker || slides.length === 0) return;
  
  function handleScroll() {
    const rect = wallTracker.getBoundingClientRect();
    
    // Calculate progress: 0 when top hits screen top, 1 when bottom hits screen bottom
    const totalHeight = rect.height - window.innerHeight;
    const progress = -rect.top / totalHeight;
    const clampedProgress = Math.max(0, Math.min(1, progress));
    
    // Update vertical scrollbar fill
    if (fillBar) {
      fillBar.style.height = `${clampedProgress * 100}%`;
    }
    
    // Interpolate opacity & transform for each slide
    // Total of 5 slides, spaced along the 0 to 1 range (0, 0.25, 0.5, 0.75, 1.0)
    const interval = 1 / (slides.length - 1);
    
    slides.forEach((slide, index) => {
      const center = index * interval;
      const distance = clampedProgress - center;
      
      // Smooth fade envelope
      // Fully visible at center, completely faded out 0.15 before or after
      let opacity = 1 - (Math.abs(distance) / 0.13);
      opacity = Math.max(0, Math.min(1, opacity));
      
      // Translation vertical parallax slide
      // Move up slightly as scroll goes down
      const translateY = distance * 150; 
      const scale = 1 - (Math.abs(distance) * 0.1);
      
      slide.style.opacity = opacity;
      slide.style.transform = `translateY(${translateY}px) scale(${scale})`;
      
      if (opacity > 0) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });
  }
  
  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Trigger initial call
}

/* 4. TIMELINE TRACK FILLING & OBSERVER REVEAL */
function initJourneyTimeline() {
  const journey = document.getElementById('journey');
  const lineFill = document.getElementById('timeline-line-fill');
  const chapters = document.querySelectorAll('.timeline-chapter');
  if (!journey) return;
  
  // Track scroll position inside journey section to expand timeline bar
  function trackTimelineProgress() {
    const rect = journey.getBoundingClientRect();
    const windowH = window.innerHeight;
    
    // Line starts loading when top enters bottom half of screen
    // Fully loads when bottom exits top half of screen
    const scrollStart = windowH * 0.8;
    const totalScrollable = rect.height - windowH * 0.4;
    const currentProgress = scrollStart - rect.top;
    
    const progressPercent = Math.max(0, Math.min(100, (currentProgress / totalScrollable) * 100));
    if (lineFill) {
      lineFill.style.height = `${progressPercent}%`;
    }
  }
  
  window.addEventListener('scroll', trackTimelineProgress);
  trackTimelineProgress();
  
  // Setup intersection observer to trigger content slide-ins
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -15% 0px',
    threshold: 0.1
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-in');
      }
    });
  }, observerOptions);
  
  chapters.forEach(ch => observer.observe(ch));
}

/* 5. REVENUE ENGINE (Live Bloomberg Dashboard) */
function initRevenueEngine() {
  const canvas = document.getElementById('dashboard-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  // Controls
  const speedSlider = document.getElementById('param-speed');
  const budgetSlider = document.getElementById('param-budget');
  const fatigueSlider = document.getElementById('param-fatigue');
  
  const speedVal = document.getElementById('val-speed');
  const budgetVal = document.getElementById('val-budget');
  const fatigueVal = document.getElementById('val-fatigue');
  
  // Live stats tags
  const liveSpend = document.getElementById('live-stat-spend');
  const liveRev = document.getElementById('live-stat-rev');
  const liveRoi = document.getElementById('live-stat-roi');
  const liveCac = document.getElementById('live-stat-cac');
  
  // Feed Buttons
  const feedButtons = document.querySelectorAll('.feed-btn');
  let currentFeed = 'rev'; // Options: 'rev', 'spend', 'roi', 'cvr'
  
  feedButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      feedButtons.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentFeed = e.target.id.replace('btn-chart-', '');
    });
  });

  // Telemetry properties
  let speed = 1.0;
  let baseBudget = 450000; // in INR
  let fatigueRate = 25; // %
  
  // Update control metrics
  function updateInputs() {
    if (speedSlider) {
      const val = parseFloat(speedSlider.value);
      speed = val / 40;
      speedVal.textContent = `${speed.toFixed(1)}x`;
    }
    if (budgetSlider) {
      const val = parseInt(budgetSlider.value);
      baseBudget = val * 1000;
      budgetVal.textContent = `₹${(baseBudget / 100000).toFixed(1)}L/d`;
    }
    if (fatigueSlider) {
      fatigueRate = parseInt(fatigueSlider.value);
      fatigueVal.textContent = `${fatigueRate}%`;
    }
  }
  
  [speedSlider, budgetSlider, fatigueSlider].forEach(slider => {
    if (slider) slider.addEventListener('input', updateInputs);
  });
  updateInputs();

  // Canvas scaling
  function resizeCanvas() {
    const rect = canvas.parentNode.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }
  
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Simulation telemetry buffers
  let dataPoints = [];
  const maxPoints = 80;
  let timeTicker = 0;
  
  // Mouse hover trace trackers
  let mouseX = -1;
  let mouseY = -1;
  
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });
  
  canvas.addEventListener('mouseleave', () => {
    mouseX = -1;
    mouseY = -1;
  });

  // Generate initial coordinates
  for (let i = 0; i < maxPoints; i++) {
    dataPoints.push({
      spend: 0,
      rev: 0,
      roi: 0,
      cvr: 0,
    });
  }

  // Live calculation ticker loop
  function updateTelemetryData() {
    timeTicker += speed * 0.15;
    
    // Model variables based on inputs
    // Higher fatigue decreases conversions. Higher speed adds volatility.
    const budgetFactor = baseBudget / 450000;
    const fatigueFactor = 1 - (fatigueRate / 150);
    
    const noise = Math.sin(timeTicker) * 0.08 + Math.cos(timeTicker * 2.3) * 0.04;
    
    // Live calculated stats
    const instantRoi = Math.max(1.8, (6.5 * fatigueFactor + noise * 4) + (budgetFactor > 1.2 ? -0.5 * budgetFactor : 0.2));
    const runningSpend = baseBudget + noise * 15000;
    const simulatedRevenue = runningSpend * instantRoi;
    const calculatedCac = Math.max(380, 680 * (1.2 - fatigueFactor) * (1 + (budgetFactor - 1) * 0.15));
    
    // Update DOM Stats Strip
    if (liveSpend) liveSpend.textContent = `₹${Math.round(runningSpend).toLocaleString('en-IN')}`;
    if (liveRev) liveRev.textContent = `₹${Math.round(simulatedRevenue).toLocaleString('en-IN')}`;
    if (liveRoi) liveRoi.textContent = `${instantRoi.toFixed(2)}x`;
    if (liveCac) liveCac.textContent = `₹${Math.round(calculatedCac)}`;

    // Add new data point to trace list
    dataPoints.shift();
    dataPoints.push({
      spend: runningSpend,
      rev: simulatedRevenue,
      roi: instantRoi,
      cvr: (instantRoi * 0.45) + (noise * 0.2), // Simulated conversion rate
    });
  }

  // Draw chart loop
  function drawTelemetryChart() {
    const width = canvas.width / window.devicePixelRatio;
    const height = canvas.height / window.devicePixelRatio;
    
    ctx.clearRect(0, 0, width, height);
    
    // 1. Draw Technical Grid Lines
    ctx.strokeStyle = '#121217';
    ctx.lineWidth = 1;
    const gridRows = 8;
    const gridCols = 12;
    
    // Horizontal lines
    for (let i = 0; i <= gridRows; i++) {
      const y = (height / gridRows) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Vertical lines
    for (let i = 0; i <= gridCols; i++) {
      const x = (width / gridCols) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Border ticks decoration
    ctx.strokeStyle = '#272730';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0, 0, width, height);

    // 2. Select metrics to map on vertical scale
    let series = [];
    let strokeColor = '#00f0ff';
    let fillColor = 'rgba(0, 240, 255, 0.03)';
    let yMin = 0, yMax = 100;
    let labelSuffix = '';
    
    if (currentFeed === 'rev') {
      series = dataPoints.map(d => d.rev);
      strokeColor = '#00f0ff';
      fillColor = 'rgba(0, 240, 255, 0.05)';
      yMax = 7000000;
      labelSuffix = ' INR';
    } else if (currentFeed === 'spend') {
      series = dataPoints.map(d => d.spend);
      strokeColor = '#0055ff';
      fillColor = 'rgba(0, 85, 255, 0.05)';
      yMax = 1100000;
      labelSuffix = ' INR';
    } else if (currentFeed === 'roi') {
      series = dataPoints.map(d => d.roi);
      strokeColor = '#00f0ff';
      fillColor = 'rgba(0, 240, 255, 0.03)';
      yMax = 12;
      labelSuffix = 'x';
    } else if (currentFeed === 'cvr') {
      series = dataPoints.map(d => d.cvr);
      strokeColor = '#ffffff';
      fillColor = 'rgba(255, 255, 255, 0.03)';
      yMax = 6;
      labelSuffix = '%';
    }

    // 3. Draw Telemetry curve
    if (series.length > 0) {
      const spacing = width / (maxPoints - 1);
      
      // Calculate coordinates mapping function
      const getX = (idx) => idx * spacing;
      const getY = (val) => {
        const pct = (val - yMin) / (yMax - yMin);
        return height - (pct * (height - 60)) - 30; // Padding top and bottom
      };

      // Draw shadow gradient fill first
      ctx.beginPath();
      ctx.moveTo(getX(0), height);
      for (let i = 0; i < series.length; i++) {
        ctx.lineTo(getX(i), getY(series[i]));
      }
      ctx.lineTo(getX(series.length - 1), height);
      ctx.closePath();
      ctx.fillStyle = fillColor;
      ctx.fill();

      // Draw primary path outline
      ctx.beginPath();
      ctx.moveTo(getX(0), getY(series[0]));
      for (let i = 1; i < series.length; i++) {
        ctx.lineTo(getX(i), getY(series[i]));
      }
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Secondary Spend comparison line if we are on Revenue Mode
      if (currentFeed === 'rev') {
        ctx.beginPath();
        ctx.moveTo(getX(0), getY(dataPoints[0].spend));
        for (let i = 1; i < series.length; i++) {
          ctx.lineTo(getX(i), getY(dataPoints[i].spend));
        }
        ctx.strokeStyle = 'rgba(0, 85, 255, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]); // Reset
      }

      // 4. Mouse Interactive coordinates scanner
      if (mouseX >= 0 && mouseX <= width) {
        // Find nearest index
        const idx = Math.max(0, Math.min(series.length - 1, Math.round(mouseX / spacing)));
        const pointX = getX(idx);
        const pointY = getY(series[idx]);
        const pointVal = series[idx];

        // Draw scanning laser line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pointX, 0);
        ctx.lineTo(pointX, height);
        ctx.stroke();

        // Draw intersection glowing node
        ctx.fillStyle = strokeColor;
        ctx.beginPath();
        ctx.arc(pointX, pointY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(pointX, pointY, 9, 0, Math.PI * 2);
        ctx.stroke();

        // Render hover text flag
        ctx.fillStyle = '#0e0e12';
        ctx.strokeStyle = '#1e1e26';
        ctx.lineWidth = 1;
        
        const textLabel = currentFeed === 'rev' || currentFeed === 'spend' 
          ? `₹${Math.round(pointVal).toLocaleString('en-IN')}` 
          : `${pointVal.toFixed(2)}${labelSuffix}`;
          
        ctx.font = '10px "JetBrains Mono"';
        const txtWidth = ctx.measureText(textLabel).width + 16;
        const rectX = Math.max(10, Math.min(width - txtWidth - 10, pointX - txtWidth / 2));
        const rectY = Math.max(20, pointY - 25);
        
        ctx.beginPath();
        ctx.roundRect(rectX, rectY, txtWidth, 18, 4);
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = '#fff';
        ctx.fillText(textLabel, rectX + 8, rectY + 12);
      }
    }
  }

  // 6. Live log logs ticking pipeline
  const ticker = document.getElementById('terminal-ticker');
  const logEvents = [
    'META_API: Budget scale adjusted on Cococart campaign',
    'GTM_SERVER: Conversions API signals matching (+18% signal calibration)',
    'CREATIVE_AUDIT: Paused fatigued ad variations (CTR below 1.2%)',
    'ASSET_DEPLOY: Uploaded 12 new visual hooks for Moon Store testing',
    'ATTRIBUTION: Syncing GA4 blended contribution margins',
    'OPTIMIZATION: Bid values adjusted on DTC lifestyle accounts',
    'LANDING_PAGE: Core conversion rates stable at 3.82%',
    'COHERENCE: 60 ad accounts connected and pacing normally',
  ];
  
  if (ticker) {
    // Populate ticker list duplicates for loop slide
    let html = '';
    const duplicatedEvents = [...logEvents, ...logEvents]; // Double length for seamless sliding loop
    duplicatedEvents.forEach(evt => {
      html += `<li>[${new Date().toLocaleTimeString()}] // ${evt}</li>`;
    });
    ticker.innerHTML = html;
  }

  // High Frequency Loop
  let frameCounter = 0;
  function updateLoop() {
    frameCounter++;
    
    // Slow down simulation update to match visual tempo
    if (frameCounter % 6 === 0) {
      updateTelemetryData();
    }
    
    drawTelemetryChart();
    requestAnimationFrame(updateLoop);
  }
  
  updateLoop();
}

/* 6. BENTO GRID SPOTLIGHT MOUSE EFFECT (Apple style) */
function initBentoSpots() {
  const boxes = document.querySelectorAll('.bento-box');
  boxes.forEach(box => {
    box.addEventListener('mousemove', (e) => {
      const rect = box.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      box.style.setProperty('--mouse-x', `${x}px`);
      box.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}
