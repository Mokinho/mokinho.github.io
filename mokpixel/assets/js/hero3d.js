/* MokPixel hero: the P mark as a 3D object, with floating pixels. */
(() => {
  const hero = document.querySelector('.hero');
  const canvas = document.getElementById('hero-3d');
  if (!hero || !canvas || typeof THREE === 'undefined') return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NEON = 0xc6f31d;
  const lin = (hex) => new THREE.Color(hex).convertSRGBToLinear();

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) { return; } // no WebGL: the photo background stays
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x000000, 9, 22);
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 11);

  /* ---- the P mark, traced from the logo (150 x 250 px) ---- */
  const S = 0.016;                      // px -> scene units
  const pt = (x, y) => new THREE.Vector2((x - 75) * S, (125 - y) * S);
  const shapeFrom = (pts) => { const s = new THREE.Shape(); s.moveTo(pts[0].x, pts[0].y); pts.slice(1).forEach(p => s.lineTo(p.x, p.y)); s.closePath(); return s; };
  const top = shapeFrom([pt(49, 0), pt(150, 0), pt(150, 50), pt(100, 100), pt(100, 50), pt(0, 50)]);
  const body = shapeFrom([pt(50, 52), pt(50, 99), pt(99, 99), pt(50, 148), pt(50, 200), pt(1, 249), pt(1, 98)]);
  const geo = new THREE.ExtrudeGeometry([top, body], {
    depth: 0.75, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.045, bevelSegments: 4, curveSegments: 1,
  });
  geo.center();

  const markMat = new THREE.MeshStandardMaterial({ color: lin(NEON), roughness: 0.3, metalness: 0.1, emissive: lin(NEON), emissiveIntensity: 0.12 });
  const mark = new THREE.Mesh(geo, markMat);

  // a darker twin behind the mark reads as a shadowed second layer, like a sticker stack
  const backMat = new THREE.MeshStandardMaterial({ color: lin(0x1c1c1c), roughness: 0.45, metalness: 0.5 });
  const back = new THREE.Mesh(geo, backMat);
  back.position.set(0.22, -0.22, -0.55);

  const markGroup = new THREE.Group();
  markGroup.add(back, mark);
  scene.add(markGroup);

  /* ---- floating pixels ---- */
  const COUNT = window.innerWidth < 700 ? 34 : 64;
  const cube = new THREE.BoxGeometry(1, 1, 1);
  const pixMat = new THREE.MeshStandardMaterial({ roughness: 0.4, metalness: 0.2 });
  const pixels = new THREE.InstancedMesh(cube, pixMat, COUNT);
  const white = lin(0xffffff), neon = lin(NEON), grey = lin(0x3a3a3a);
  const seeds = [];
  const rand = (a, b) => a + Math.random() * (b - a);
  for (let i = 0; i < COUNT; i++) {
    const r = rand(2.4, 6.2), a = rand(0, Math.PI * 2);
    seeds.push({
      x: Math.cos(a) * r * 1.25, y: rand(-3.6, 3.6), z: Math.sin(a) * r * 0.6 - 1,
      s: rand(0.07, 0.24), sp: rand(0.15, 0.5), ph: rand(0, Math.PI * 2),
      rx: rand(-1, 1), ry: rand(-1, 1),
    });
    const roll = Math.random();
    pixels.setColorAt(i, roll < 0.55 ? neon : roll < 0.8 ? white : grey);
  }
  pixels.instanceColor.needsUpdate = true;
  const pixelGroup = new THREE.Group();
  pixelGroup.add(pixels);
  scene.add(pixelGroup);

  /* ---- light ---- */
  scene.add(new THREE.AmbientLight(0xffffff, 0.25));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(-4, 5, 8);
  scene.add(key);
  const rim = new THREE.PointLight(NEON, 2.2, 18);
  rim.position.set(4, -2, -3);
  scene.add(rim);
  const fill = new THREE.PointLight(0xffffff, 0.6, 20);
  fill.position.set(5, 4, 4);
  scene.add(fill);

  /* ---- layout: mark sits right on wide screens, low-centre on phones ---- */
  let wide = true, baseY = 0;
  const resize = () => {
    const w = hero.clientWidth, h = hero.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const visH = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    const visW = visH * camera.aspect;
    wide = camera.aspect > 1.05;
    if (wide) {
      baseY = 0.1;
      markGroup.position.set(visW * 0.27, baseY, 0);
      markGroup.scale.setScalar(Math.min(1.05, visH / 6.4));
      pixelGroup.position.set(visW * 0.18, 0, 0);
    } else {
      baseY = -visH * 0.3;
      markGroup.position.set(visW * 0.16, baseY, 0);
      markGroup.scale.setScalar(Math.min(0.8, visW / 6.2));
      pixelGroup.position.set(0, -visH * 0.22, 0);
    }
  };
  resize();
  window.addEventListener('resize', () => { resize(); if (!running) draw(1.2); });

  /* ---- pointer tilt ---- */
  const target = { x: 0, y: 0 }, tilt = { x: 0, y: 0 };
  window.addEventListener('pointermove', (e) => {
    target.x = (e.clientX / window.innerWidth) * 2 - 1;
    target.y = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  /* ---- loop ---- */
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e3 = new THREE.Euler(), p3 = new THREE.Vector3(), s3 = new THREE.Vector3();
  const clock = new THREE.Clock();
  const draw = (t) => {
    tilt.x += (target.x - tilt.x) * 0.05;
    tilt.y += (target.y - tilt.y) * 0.05;
    markGroup.rotation.y = -0.45 + Math.sin(t * 0.35) * 0.35 + tilt.x * 0.35;
    markGroup.rotation.x = 0.08 + Math.sin(t * 0.25) * 0.06 + tilt.y * 0.18;
    markGroup.rotation.z = -0.06;
    markGroup.position.y = baseY + Math.sin(t * 0.8) * 0.12;

    for (let i = 0; i < COUNT; i++) {
      const sd = seeds[i];
      p3.set(sd.x + Math.sin(t * sd.sp + sd.ph) * 0.25, sd.y + Math.sin(t * sd.sp * 0.8 + sd.ph) * 0.45, sd.z);
      e3.set(t * sd.rx * 0.6, t * sd.ry * 0.6, 0);
      q.setFromEuler(e3);
      s3.setScalar(sd.s);
      m.compose(p3, q, s3);
      pixels.setMatrixAt(i, m);
    }
    pixels.instanceMatrix.needsUpdate = true;
    pixelGroup.rotation.y = t * 0.04 + tilt.x * 0.1;
    renderer.render(scene, camera);
  };

  let running = false, raf = 0, visible = true;
  const loop = () => { draw(clock.getElapsedTime()); raf = requestAnimationFrame(loop); };
  const start = () => { if (!running && visible && !document.hidden && !reduceMotion) { running = true; clock.start(); loop(); } };
  const stop = () => { running = false; cancelAnimationFrame(raf); };

  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; visible ? start() : stop(); }).observe(hero);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));

  draw(1.2); // first frame (and the only one with reduced motion)
  hero.classList.add('is-3d');
  start();
})();
