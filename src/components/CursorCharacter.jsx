import { useEffect, useRef } from 'react';

// --- Sprite paths ---
const IDLE_FRAMES = [
  '/sprites/idle_back-removebg-preview.png',
  '/sprites/idle_pose-removebg-preview.png',
];
const WALK_FRAMES = [
  '/sprites/walk_walk1-removebg-preview.png',
  '/sprites/walk_walk2-removebg-preview.png',
];
const RUN_FRAMES = WALK_FRAMES;

const EMOTE_SUNGLASSES = '/sprites/emote_sunglasses-removebg-preview.png';
const EMOTE_SLEEPING   = '/sprites/emote_sleeping-removebg-preview.png';
const EMOTE_HUMMING    = '/sprites/emote_humming-removebg-preview.png';
const EMOTE_THUMBSUP   = '/sprites/emote_thumbsup-removebg-preview.png';

// --- Frame sizes at 40% scale ---
const IDLE_W  = Math.round(307 * 0.4); // 123
const WALK_W  = Math.round(256 * 0.4); // 102
const HEIGHT  = Math.round(341 * 0.4); // 136

// --- Velocity thresholds (px/RAF tick ≈ 16ms) ---
const WALK_THRESHOLD = 1.5;
const RUN_THRESHOLD  = 9;

// --- Animation intervals ---
const IDLE_MS = 700;
const WALK_MS = 160;
const RUN_MS  = 80;

// --- Idle emote timers ---
const HUMMING_AFTER_MS  = 10_000; // 10 s → humming
const SLEEPING_AFTER_MS = 30_000; // 30 s → sleeping

// Lerp: how quickly char catches cursor X
const LERP = 0.1;

// Anything matching this selector triggers hover emotes
const BTN = 'button, a, [role="button"], input[type="submit"], input[type="button"]';

const CursorCharacter = () => {
  const imgRef = useRef(null);

  const s = useRef({
    targetX:     window.innerWidth / 2,
    charX:       window.innerWidth / 2,
    prevTarget:  window.innerWidth / 2,
    vel:         0,
    anim:        'idle',   // 'idle' | 'walk' | 'run'
    frame:       0,
    lastFrameAt: 0,
    facingRight: true,
    // Idle-time tracking
    lastMovedAt: performance.now(),
    // Button hover/press flags
    hoverBtn:    false,
    pressBtn:    false,
    raf:         null,
  });

  useEffect(() => {
    // Preload every sprite so src swaps never flicker
    [
      ...IDLE_FRAMES, ...WALK_FRAMES,
      EMOTE_SUNGLASSES, EMOTE_SLEEPING, EMOTE_HUMMING, EMOTE_THUMBSUP,
    ].forEach(src => { const p = new Image(); p.src = src; });

    const r   = s.current;
    const img = imgRef.current;

    // --- Mouse tracking ---
    const onMove = (e) => {
      r.targetX    = e.clientX;
      r.lastMovedAt = performance.now();
    };
    window.addEventListener('mousemove', onMove, { passive: true });

    // --- Button hover detection (event delegation) ---
    const onOver = (e) => { if (e.target.closest(BTN)) r.hoverBtn = true;  };
    const onOut  = (e) => { if (e.target.closest(BTN)) r.hoverBtn = false; };
    document.addEventListener('mouseover', onOver, { passive: true });
    document.addEventListener('mouseout',  onOut,  { passive: true });

    // --- Button press detection ---
    const onDown = (e) => { if (e.target.closest(BTN)) r.pressBtn = true;  };
    const onUp   = ()  => { r.pressBtn = false; };
    document.addEventListener('mousedown', onDown, { passive: true });
    document.addEventListener('mouseup',   onUp,   { passive: true });

    // --- RAF loop ---
    const tick = (now) => {
      // Velocity with EMA smoothing
      const rawDelta = r.targetX - r.prevTarget;
      r.vel       = r.vel * 0.65 + rawDelta * 0.35;
      r.prevTarget = r.targetX;

      // Movement animation state
      const speed    = Math.abs(r.vel);
      const moveAnim =
        speed < WALK_THRESHOLD ? 'idle' :
        speed < RUN_THRESHOLD  ? 'walk' : 'run';

      if (moveAnim !== r.anim) {
        r.anim       = moveAnim;
        r.frame      = 0;
        r.lastFrameAt = now;
      }

      // Facing direction (deadband avoids flip-jitter at rest)
      if      (r.vel >  0.4) r.facingRight = true;
      else if (r.vel < -0.4) r.facingRight = false;

      // Smooth position follow
      r.charX += (r.targetX - r.charX) * LERP;

      // --- Determine what to draw ---
      // Idle elapsed — only counts when character is in idle anim
      const idleMs = r.anim === 'idle' ? now - r.lastMovedAt : 0;

      // Priority: thumbsup > sunglasses > sleeping > humming > normal
      let src, frameW;

      if (r.pressBtn) {
        src    = EMOTE_THUMBSUP;
        frameW = IDLE_W;
      } else if (r.hoverBtn) {
        src    = EMOTE_SUNGLASSES;
        frameW = IDLE_W;
      } else if (idleMs >= SLEEPING_AFTER_MS) {
        src    = EMOTE_SLEEPING;
        frameW = IDLE_W;
      } else if (idleMs >= HUMMING_AFTER_MS) {
        src    = EMOTE_HUMMING;
        frameW = IDLE_W;
      } else {
        // Normal walk / run / idle animation
        const frames =
          r.anim === 'idle' ? IDLE_FRAMES :
          r.anim === 'walk' ? WALK_FRAMES : RUN_FRAMES;
        const msPerFrame =
          r.anim === 'idle' ? IDLE_MS :
          r.anim === 'walk' ? WALK_MS : RUN_MS;
        frameW = r.anim === 'idle' ? IDLE_W : WALK_W;

        if (now - r.lastFrameAt >= msPerFrame) {
          r.frame      = (r.frame + 1) % frames.length;
          r.lastFrameAt = now;
        }
        src = frames[r.frame];
      }

      // Write to DOM
      img.src             = src;
      img.style.left      = `${r.charX}px`;
      img.style.width     = `${frameW}px`;
      img.style.transform = `translateX(-50%) scaleX(${r.facingRight ? 1 : -1})`;

      r.raf = requestAnimationFrame(tick);
    };

    r.raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout',  onOut);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('mouseup',   onUp);
      cancelAnimationFrame(r.raf);
    };
  }, []);

  return (
    <img
      ref={imgRef}
      src={IDLE_FRAMES[0]}
      alt=""
      draggable={false}
      style={{
        position:        'fixed',
        bottom:          0,
        left:            '50%',
        width:           `${IDLE_W}px`,
        height:          `${HEIGHT}px`,
        objectFit:       'contain',
        objectPosition:  'bottom center',
        pointerEvents:   'none',
        zIndex:          9999,
        transformOrigin: 'center bottom',
        willChange:      'transform, left',
        userSelect:      'none',
      }}
    />
  );
};

export default CursorCharacter;
