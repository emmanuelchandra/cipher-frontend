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
// Run reuses walk frames at higher speed (no dedicated run sprites)
const RUN_FRAMES = WALK_FRAMES;

// --- Frame sizes (px) at 40% scale ---
const IDLE_W = Math.round(307 * 0.4); // 123
const WALK_W = Math.round(256 * 0.4); // 102
const HEIGHT  = Math.round(341 * 0.4); // 136

// --- Velocity thresholds (px per RAF tick, ~16 ms) ---
const WALK_THRESHOLD = 1.5;
const RUN_THRESHOLD  = 9;

// --- ms per frame for each animation ---
const IDLE_MS = 700;
const WALK_MS = 160;
const RUN_MS  = 80;

// Lerp factor: how fast char catches up to cursor X (0–1)
const LERP = 0.1;

const CursorCharacter = () => {
  const imgRef = useRef(null);

  // All mutable animation state in one ref — never triggers re-renders
  const s = useRef({
    targetX:    window.innerWidth / 2,
    charX:      window.innerWidth / 2,
    prevTarget: window.innerWidth / 2,
    vel:        0,            // smoothed velocity
    anim:       'idle',       // 'idle' | 'walk' | 'run'
    frame:      0,
    lastFrameAt: 0,
    facingRight: true,
    raf:        null,
  });

  useEffect(() => {
    // Preload all frames so src swaps are instant (no flicker)
    [...IDLE_FRAMES, ...WALK_FRAMES].forEach(src => {
      const pre = new Image();
      pre.src = src;
    });

    const r  = s.current;
    const img = imgRef.current;

    const onMouseMove = (e) => { r.targetX = e.clientX; };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    const tick = (now) => {
      // Raw delta then exponential smoothing to reduce jitter
      const rawDelta = r.targetX - r.prevTarget;
      r.vel = r.vel * 0.65 + rawDelta * 0.35;
      r.prevTarget = r.targetX;

      // Choose animation state
      const speed = Math.abs(r.vel);
      const nextAnim =
        speed < WALK_THRESHOLD ? 'idle' :
        speed < RUN_THRESHOLD  ? 'walk' : 'run';

      if (nextAnim !== r.anim) {
        r.anim       = nextAnim;
        r.frame      = 0;
        r.lastFrameAt = now;
      }

      // Facing direction — deadband ±0.4 px to avoid flip jitter at rest
      if (r.vel >  0.4) r.facingRight = true;
      else if (r.vel < -0.4) r.facingRight = false;

      // Smooth follow
      r.charX += (r.targetX - r.charX) * LERP;

      // Resolve frames + timing for current anim
      const frames =
        r.anim === 'idle' ? IDLE_FRAMES :
        r.anim === 'walk' ? WALK_FRAMES : RUN_FRAMES;
      const msPerFrame =
        r.anim === 'idle' ? IDLE_MS :
        r.anim === 'walk' ? WALK_MS : RUN_MS;
      const frameW =
        r.anim === 'idle' ? IDLE_W : WALK_W;

      // Advance frame on interval
      if (now - r.lastFrameAt >= msPerFrame) {
        r.frame = (r.frame + 1) % frames.length;
        r.lastFrameAt = now;
      }

      // Write directly to DOM — no React state, no re-render
      img.src              = frames[r.frame];
      img.style.left       = `${r.charX}px`;
      img.style.width      = `${frameW}px`;
      img.style.transform  = `translateX(-50%) scaleX(${r.facingRight ? 1 : -1})`;

      r.raf = requestAnimationFrame(tick);
    };

    r.raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
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
        imageRendering:  'auto',
      }}
    />
  );
};

export default CursorCharacter;
