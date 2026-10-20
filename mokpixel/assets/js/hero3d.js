/* MokPixel hero: a wireframe "sketch" of the P mark; a liquid blob that follows the
   cursor (or finger) reveals the finished neon render underneath. */
(() => {
  const hero = document.querySelector('.hero');
  const canvas = document.getElementById('hero-3d');
  if (!hero || !canvas || typeof THREE === 'undefined') return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NEON = 0xc6f31d;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) { return; } // no WebGL: the photo background stays
  if (!renderer.getContext()) return;
  renderer.setClearColor(0x000000, 0);
  const isGL2 = renderer.capabilities.isWebGL2;

  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 12);

  /* ---- the P mark, traced from the logo (150 x 250 px) ---- */
  const S = 0.016;
  const pt = (x, y) => new THREE.Vector2((x - 75) * S, (125 - y) * S);
  const shapeFrom = (pts) => { const s = new THREE.Shape(); s.moveTo(pts[0].x, pts[0].y); pts.slice(1).forEach((p) => s.lineTo(p.x, p.y)); s.closePath(); return s; };
  const top = shapeFrom([pt(49, 0), pt(150, 0), pt(150, 50), pt(100, 100), pt(100, 50), pt(0, 50)]);
  const body = shapeFrom([pt(50, 52), pt(50, 99), pt(99, 99), pt(50, 148), pt(50, 200), pt(1, 249), pt(1, 98)]);
  const geo = new THREE.ExtrudeGeometry([top, body], { depth: 0.75, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.045, bevelSegments: 3, curveSegments: 1 });
  geo.center();
  const edges = new THREE.EdgesGeometry(geo, 25);

  /* ---- floating pixels: shared layout for both layers ---- */
  const COUNT = window.innerWidth < 700 ? 26 : 48;
  const rand = (a, b) => a + Math.random() * (b - a);
  const seeds = Array.from({ length: COUNT }, () => {
    const r = rand(2.6, 5.4), a = rand(0, Math.PI * 2);
    return { x: Math.cos(a) * r * 1.2, y: rand(-3.4, 3.4), z: Math.sin(a) * r * 0.5 - 0.5, s: rand(0.08, 0.22), sp: rand(0.15, 0.45), ph: rand(0, Math.PI * 2), rx: rand(-1, 1), ry: rand(-1, 1) };
  });
  const cube = new THREE.BoxGeometry(1, 1, 1);

  /* ---- layer 1: the sketch ---- */
  const sketch = new THREE.Scene();
  const sGroup = new THREE.Group();
  const sMark = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xd8d8d0 }));
  const sBack = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x4a4a46 }));
  sBack.position.set(0.22, -0.22, -0.55);
  const dome = new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(3.1, 2)), new THREE.LineBasicMaterial({ color: 0x1e1e1c }));
  dome.position.z = -1.2;
  const g = 2.6, guidePts = [-g, 0, 0, g, 0, 0, 0, -3.2, 0, 0, 3.2, 0, -g, 2.0, 0, g, 2.0, 0, -g, -2.0, 0, g, -2.0, 0];
  const guideGeo = new THREE.BufferGeometry(); guideGeo.setAttribute('position', new THREE.Float32BufferAttribute(guidePts, 3));
  const guides = new THREE.LineSegments(guideGeo, new THREE.LineBasicMaterial({ color: 0x33332f }));
  sGroup.add(dome, guides, sBack, sMark);
  sketch.add(sGroup);
  const sPixels = new THREE.InstancedMesh(cube, new THREE.MeshBasicMaterial({ color: 0x8a8a84, wireframe: true }), COUNT);
  const sPixGroup = new THREE.Group(); sPixGroup.add(sPixels); sketch.add(sPixGroup);

  /* ---- layer 2: the finished render ---- */
  const render = new THREE.Scene();
  const rGroup = new THREE.Group();
  const rMark = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: NEON, roughness: 0.3, metalness: 0.1, emissive: NEON, emissiveIntensity: 0.06 }));
  const rBack = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x1c1c1c, roughness: 0.45, metalness: 0.5 }));
  rBack.position.copy(sBack.position);
  rGroup.add(rBack, rMark);
  render.add(rGroup);
  const rPixels = new THREE.InstancedMesh(cube, new THREE.MeshStandardMaterial({ roughness: 0.4, metalness: 0.2 }), COUNT);
  const cNeon = new THREE.Color(NEON), cWhite = new THREE.Color(0xffffff), cGrey = new THREE.Color(0x3a3a3a);
  for (let i = 0; i < COUNT; i++) { const r = Math.random(); rPixels.setColorAt(i, r < 0.55 ? cNeon : r < 0.8 ? cWhite : cGrey); }
  rPixels.instanceColor.needsUpdate = true;
  const rPixGroup = new THREE.Group(); rPixGroup.add(rPixels); render.add(rPixGroup);
  render.add(new THREE.AmbientLight(0xffffff, 0.3));
  const key = new THREE.DirectionalLight(0xffffff, 1.5); key.position.set(-4, 5, 8); render.add(key);
  const rim = new THREE.PointLight(NEON, 2.0, 18); rim.position.set(4, -2, -3); render.add(rim);
  const fill = new THREE.PointLight(0xffffff, 0.5, 20); fill.position.set(5, 4, 4); render.add(fill);

  /* ---- render targets + composite ---- */
  const RT = isGL2 && THREE.WebGLMultisampleRenderTarget ? THREE.WebGLMultisampleRenderTarget : THREE.WebGLRenderTarget;
  const makeRT = () => { const t = new RT(2, 2, { format: THREE.RGBAFormat }); if (t.samples !== undefined) t.samples = 4; return t; };
  const rtA = makeRT(), rtB = makeRT();

  const maskCanvas = document.createElement('canvas');
  const mctx = maskCanvas.getContext('2d');
  const maskTex = new THREE.CanvasTexture(maskCanvas);
  maskTex.minFilter = THREE.LinearFilter; maskTex.magFilter = THREE.LinearFilter;

  const quadScene = new THREE.Scene();
  const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quadMat = new THREE.ShaderMaterial({
    uniforms: { tA: { value: rtA.texture }, tB: { value: rtB.texture }, tM: { value: maskTex }, uTime: { value: 0 }, uLock: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) }, uNeon: { value: new THREE.Color(NEON) } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: [
      'uniform sampler2D tA, tB, tM; uniform float uTime, uLock; uniform vec2 uRes; uniform vec3 uNeon; varying vec2 vUv;',
      'float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }',
      'float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);',
      '  return mix(mix(hash(i), hash(i+vec2(1.0,0.0)), f.x), mix(hash(i+vec2(0.0,1.0)), hash(i+vec2(1.0,1.0)), f.x), f.y); }',
      'void main(){',
      '  float m = texture2D(tM, vUv).r;',
      '  vec2 p = vUv * uRes;',
      '  float n = noise(p / 110.0 + uTime * 0.35) * 0.6 + noise(p / 45.0 - uTime * 0.5) * 0.4;',
      '  m = max(m + (n - 0.5) * 0.38, uLock);',
      '  float k = smoothstep(0.44, 0.52, m);',
      '  vec4 a = texture2D(tA, vUv); vec4 b = texture2D(tB, vUv);',
      '  vec4 c = mix(a, b, k);',
      '  float edge = smoothstep(0.36, 0.45, m) * (1.0 - smoothstep(0.45, 0.54, m)) * (1.0 - uLock);',
      '  c.rgb += uNeon * edge * 0.85; c.a = max(c.a, edge * 0.85);',
      '  gl_FragColor = c;',
      '}',
    ].join('\n'),
    depthTest: false, depthWrite: false, blending: THREE.NoBlending,
  });
  quadScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), quadMat));

  /* ---- layout ---- */
  let W = 1, H = 1, baseY = 0, markX = 0, mw = 1, mh = 1;
  const blobHome = { x: 0.5, y: 0.4 };
  const resize = () => {
    W = hero.clientWidth; H = hero.clientHeight;
    const pr = Math.min(window.devicePixelRatio || 1, 1.75);
    renderer.setPixelRatio(pr);
    renderer.setSize(W, H, false);
    rtA.setSize(W * pr, H * pr); rtB.setSize(W * pr, H * pr);
    quadMat.uniforms.uRes.value.set(W, H);
    camera.aspect = W / H; camera.updateProjectionMatrix();
    const visH = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    const visW = visH * camera.aspect;
    const landscapeShort = H < 520 && W / H > 1.3;
    const markScale = landscapeShort ? (visH * 0.62) / 4 : Math.min((visH * 0.46) / 4, (visW * 0.5) / 2.4);
    baseY = landscapeShort ? visH * 0.02 : visH * (W < 700 ? 0.12 : 0.1);
    markX = landscapeShort ? visW * 0.24 : 0;
    blobHome.x = landscapeShort ? 0.74 : 0.5; blobHome.y = landscapeShort ? 0.48 : 0.4;
    [sGroup, rGroup].forEach((grp) => { grp.scale.setScalar(markScale); grp.position.set(markX, baseY, 0); });
    const pixScale = Math.min(1.15, visW / 7.5);
    [sPixGroup, rPixGroup].forEach((grp) => { grp.scale.setScalar(pixScale); grp.position.set(markX, baseY * 0.6, 0); });
    mw = 220; mh = Math.max(60, Math.round(mw * H / W));
    maskCanvas.width = mw; maskCanvas.height = mh;
    mctx.fillStyle = '#000'; mctx.fillRect(0, 0, mw, mh);
  };

  /* ---- pointer / auto-wander ---- */
  const pointer = { x: 0.5, y: 0.42 }, blob = { x: 0.5, y: 0.42 }, tilt = { x: 0, y: 0 };
  let lastMove = -10, lastT = 0, inside = false;
  const fineHover = window.matchMedia('(hover: hover)');
  const toLocal = (cx, cy) => { const r = hero.getBoundingClientRect(); return { x: (cx - r.left) / r.width, y: (cy - r.top) / r.height }; };
  hero.addEventListener('pointermove', (e) => { const p = toLocal(e.clientX, e.clientY); pointer.x = p.x; pointer.y = p.y; lastMove = lastT; inside = true; }, { passive: true });
  hero.addEventListener('pointerdown', (e) => { const p = toLocal(e.clientX, e.clientY); pointer.x = blob.x = p.x; pointer.y = blob.y = p.y; lastMove = lastT; }, { passive: true });
  hero.addEventListener('pointerleave', () => { inside = false; });
  hero.addEventListener('touchmove', (e) => { const t = e.touches[0]; if (!t) return; const p = toLocal(t.clientX, t.clientY); pointer.x = p.x; pointer.y = p.y; lastMove = lastT; }, { passive: true });

  /* ---- lock button ---- */
  const lockBtn = hero.querySelector('.lock-btn');
  const lockLabel = document.getElementById('lock-label');
  let lockTarget = reduceMotion ? 1 : 0;
  let running = false;
  if (lockBtn) {
    const sync = () => { lockBtn.setAttribute('aria-pressed', String(lockTarget === 1)); if (lockLabel) lockLabel.textContent = lockTarget ? 'Tap to sketch' : 'Tap to reveal'; };
    lockBtn.addEventListener('click', () => { lockTarget = lockTarget ? 0 : 1; sync(); if (!running) draw(lastT || 1.2); });
    sync();
  }

  const stamp = (x, y, r, a) => {
    const gx = x * mw, gy = y * mh, rr = r * mh;
    const grd = mctx.createRadialGradient(gx, gy, 0, gx, gy, rr);
    grd.addColorStop(0, `rgba(255,255,255,${a})`); grd.addColorStop(0.55, `rgba(255,255,255,${a * 0.7})`); grd.addColorStop(1, 'rgba(255,255,255,0)');
    mctx.fillStyle = grd; mctx.fillRect(gx - rr, gy - rr, rr * 2, rr * 2);
  };

  /* ---- frame ---- */
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e3 = new THREE.Euler(), p3 = new THREE.Vector3(), s3 = new THREE.Vector3();
  const draw = (t) => {
    const dt = Math.max(0.008, Math.min(0.05, t - lastT)); lastT = t;

    // blob: follow the pointer, or wander around the mark when idle
    const idle = t - lastMove > 2.2 || (!inside && fineHover.matches && t - lastMove > 0.6);
    const tx = idle ? blobHome.x + Math.sin(t * 0.55) * 0.14 : pointer.x;
    const ty = idle ? blobHome.y + Math.sin(t * 0.8 + 1.2) * 0.12 : pointer.y;
    const px = blob.x, py = blob.y;
    blob.x += (tx - blob.x) * (idle ? 0.04 : 0.22);
    blob.y += (ty - blob.y) * (idle ? 0.04 : 0.22);

    // mask: fade the trail, then stamp along the path
    mctx.fillStyle = `rgba(0,0,0,${0.03 + dt * 0.9})`; mctx.fillRect(0, 0, mw, mh);
    const steps = Math.max(1, Math.ceil(Math.hypot((blob.x - px) * mw, (blob.y - py) * mh) / 3));
    const rad = W < 700 ? 0.2 : 0.26;
    for (let i = 1; i <= steps; i++) stamp(px + (blob.x - px) * (i / steps), py + (blob.y - py) * (i / steps), rad, 0.3);
    maskTex.needsUpdate = true;

    // shared motion for both layers
    tilt.x += ((pointer.x - 0.5) * 2 - tilt.x) * 0.04;
    tilt.y += ((pointer.y - 0.5) * 2 - tilt.y) * 0.04;
    const ry = -0.35 + Math.sin(t * 0.35) * 0.3 + tilt.x * 0.3;
    const rx = 0.06 + Math.sin(t * 0.25) * 0.05 + tilt.y * 0.12;
    const yb = baseY + Math.sin(t * 0.8) * 0.1;
    [sGroup, rGroup].forEach((grp) => { grp.rotation.set(rx, ry, -0.05); grp.position.y = yb; });
    dome.rotation.y = -ry * 0.6 + t * 0.05;

    for (let i = 0; i < COUNT; i++) {
      const sd = seeds[i];
      p3.set(sd.x + Math.sin(t * sd.sp + sd.ph) * 0.25, sd.y + Math.sin(t * sd.sp * 0.8 + sd.ph) * 0.4, sd.z);
      e3.set(t * sd.rx * 0.5, t * sd.ry * 0.5, 0); q.setFromEuler(e3); s3.setScalar(sd.s);
      m4.compose(p3, q, s3);
      sPixels.setMatrixAt(i, m4); rPixels.setMatrixAt(i, m4);
    }
    sPixels.instanceMatrix.needsUpdate = true; rPixels.instanceMatrix.needsUpdate = true;
    sPixGroup.rotation.y = rPixGroup.rotation.y = t * 0.035 + tilt.x * 0.08;

    const lock = quadMat.uniforms.uLock;
    lock.value += (lockTarget - lock.value) * (running ? 0.06 : 1);
    quadMat.uniforms.uTime.value = t;

    renderer.setRenderTarget(rtA); renderer.clear(); renderer.render(sketch, camera);
    renderer.setRenderTarget(rtB); renderer.clear(); renderer.render(render, camera);
    renderer.setRenderTarget(null); renderer.clear(); renderer.render(quadScene, quadCam);
  };

  /* ---- loop control ---- */
  const clock = new THREE.Clock();
  let raf = 0, visible = true;
  const loop = () => { draw(clock.getElapsedTime() + 1.2); raf = requestAnimationFrame(loop); };
  const start = () => { if (!running && visible && !document.hidden && !reduceMotion) { running = true; loop(); } };
  const stop = () => { running = false; cancelAnimationFrame(raf); };

  resize();
  let rT = 0;
  window.addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(() => { resize(); if (!running) draw(lastT || 1.2); }, 80); });
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; visible ? start() : stop(); }).observe(hero);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));

  draw(1.2);
  hero.classList.add('is-3d');
  start();
})();
