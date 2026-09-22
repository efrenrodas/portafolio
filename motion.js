const host = document.querySelector('#laptop-scene');
const toggle = document.querySelector('.motion-toggle');
const sections = [...document.querySelectorAll('[data-scene]')];
const chapterLinks = [...document.querySelectorAll('.chapter-nav a')];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

async function initScene() {
  const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.182.0/build/three.module.js');
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setClearColor(0x080b12, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.append(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 80);
  camera.position.set(0, 1.1, 11);
  camera.lookAt(0, 0, 0);
  scene.add(new THREE.HemisphereLight(0xcbdcff, 0x111827, 2.8));
  const key = new THREE.DirectionalLight(0xffffff, 4);
  key.position.set(-3, 6, 5);
  scene.add(key);
  const rim = new THREE.PointLight(0x155eef, 65, 25);
  rim.position.set(5, 2, -3);
  scene.add(rim);
  const fill = new THREE.PointLight(0x89b7ff, 25, 20);
  fill.position.set(-4, -1, 4);
  scene.add(fill);

  const laptop = new THREE.Group();
  scene.add(laptop);
  const aluminum = new THREE.MeshStandardMaterial({ color: 0x7d8a9e, metalness: 0.8, roughness: 0.28 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x0a0e18, metalness: 0.3, roughness: 0.4 });
  const keyMaterial = new THREE.MeshStandardMaterial({ color: 0x17202f, metalness: 0.15, roughness: 0.6 });
  const trim = new THREE.MeshStandardMaterial({ color: 0x46617f, metalness: 0.85, roughness: 0.25 });
  function box(width, height, depth, material, x, y, z, parent = laptop) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  }
  // A real 3D model assembled locally: chassis, hinge, lid, keys and trackpad.
  box(5.2, 0.12, 3.15, aluminum, 0, -1.03, 0.48);
  box(5.06, 0.04, 3.02, trim, 0, -1.1, 0.48);
  box(0.55, 0.025, 0.1, dark, 0, -0.965, 2);
  const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 4.75, 16), dark);
  hinge.rotation.z = Math.PI / 2;
  hinge.position.set(0, -0.95, -1.01);
  laptop.add(hinge);
  const lid = new THREE.Group();
  lid.position.set(0, -0.98, -1.01);
  lid.rotation.x = -0.14;
  laptop.add(lid);
  box(5.18, 3.24, 0.12, aluminum, 0, 1.62, 0, lid);
  box(5.05, 3.11, 0.025, dark, 0, 1.62, 0.071, lid);
  box(0.045, 0.045, 0.012, trim, 0, 3.13, 0.092, lid);
  box(4.65, 0.018, 1.49, dark, 0, -0.957, -0.08);
  const keyGeometry = new THREE.BoxGeometry(0.285, 0.032, 0.215);
  const keys = new THREE.InstancedMesh(keyGeometry, keyMaterial, 65);
  const matrix = new THREE.Matrix4();
  let keyIndex = 0;
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 13; col++) {
      matrix.makeTranslation(-2.04 + col * 0.34, -0.923, -0.66 + row * 0.27);
      keys.setMatrixAt(keyIndex++, matrix);
    }
  }
  laptop.add(keys);
  box(1.8, 0.025, 0.2, keyMaterial, 0, -0.923, 0.69);
  box(1.74, 0.012, 0.81, trim, 0, -0.96, 1.31);
  box(1.69, 0.014, 0.76, aluminum, 0, -0.951, 1.31);
  for (const x of [-2.59, 2.59]) {
    box(0.014, 0.045, 0.22, dark, x, -1.027, 0.02);
    box(0.014, 0.045, 0.22, dark, x, -1.027, 0.43);
  }

  function makeScreen(index) {
    const canvas = document.createElement('canvas');
    canvas.width = 1280; canvas.height = 780;
    const c = canvas.getContext('2d');
    function rect(x, y, w, h, color, radius = 0) {
      c.fillStyle = color; c.beginPath(); c.roundRect(x, y, w, h, radius); c.fill();
    }
    function text(label, x, y, size = 22, color = '#ffffff', weight = 400) {
      c.font = `${weight} ${size}px Arial, sans-serif`; c.fillStyle = color; c.fillText(label, x, y);
    }
    rect(0, 0, 1280, 780, '#090f1e');
    rect(0, 0, 1280, 48, '#1d273b');
    ['#8498b8', '#617496', '#425677'].forEach((color, i) => rect(20 + i * 23, 18, 10, 10, color, 5));
    rect(370, 10, 540, 28, '#111a2b', 7);
    text(['compu-expertos / ideas en movimiento', 'mifactura.io', 'miticket.ec', 'sanisidro.edu.ec'][index], 400, 30, 15, '#b5c6e3');
    if (index === 0) {
      const gradient = c.createLinearGradient(0, 50, 1280, 780);
      gradient.addColorStop(0, '#061432'); gradient.addColorStop(1, '#155eef');
      rect(0, 48, 1280, 732, gradient);
      c.strokeStyle = '#ffffff14'; c.lineWidth = 1;
      for (let x = 0; x < 1280; x += 65) { c.beginPath(); c.moveTo(x, 48); c.lineTo(x, 780); c.stroke(); }
      for (let y = 65; y < 780; y += 65) { c.beginPath(); c.moveTo(0, y); c.lineTo(1280, y); c.stroke(); }
      text('COMPU-EXPERTOS', 76, 132, 22, '#a7c4ff', 700);
      text('Ideas que', 76, 300, 100, '#ffffff', 700);
      text('cobran vida.', 76, 410, 100, '#ffffff', 700);
      text('Software. Experiencias. Posibilidades.', 80, 480, 27, '#c9dcff');
      ['01  MiFactura.io', '02  MiTicket.ec', '03  San Isidro'].forEach((name, i) => {
        rect(78 + i * 380, 605, 350, 82, '#ffffff12', 12);
        text(name, 104 + i * 380, 655, 25, '#ffffff', 600);
      });
      text('↗', 1030, 325, 150, '#87b2ff');
    } else if (index === 1) {
      rect(0, 48, 1280, 732, '#f0f4fa'); rect(0, 48, 245, 732, '#102654');
      text('mifactura.io', 25, 112, 29, '#ffffff', 700);
      ['Mi negocio', 'Facturación', 'Punto de venta', 'Inventario', 'Contabilidad'].forEach((label, i) => {
        if (i === 0) rect(15, 157, 216, 56, '#155eef', 8);
        text(label, 32, 191 + i * 76, 20, '#dae7ff');
      });
      text('Tu negocio, conectado.', 285, 119, 36, '#122443', 700);
      text('Una vista general de tu operación', 286, 159, 20, '#70829c');
      ['Facturación', 'Inventario', 'Contabilidad'].forEach((label, i) => {
        rect(283 + i * 318, 203, 295, 147, '#ffffff', 12);
        text(label, 307 + i * 318, 246, 21, '#536781');
        text(['Emite y gestiona', 'Todo en orden', 'Más claridad'][i], 307 + i * 318, 298, 25, '#155eef', 700);
      });
      rect(283, 380, 933, 324, '#ffffff', 12);
      text('Actividad del negocio', 312, 426, 22, '#122443', 700);
      for (let i = 0; i < 13; i++) {
        const h = 50 + Math.sin(i * 1.7) * 30 + i * 9;
        rect(322 + i * 65, 656 - h, 34, h, i > 8 ? '#155eef' : '#b5ceff', 6);
      }
    } else if (index === 2) {
      rect(0, 48, 1280, 732, '#0a1020');
      text('miticket.ec', 54, 114, 35, '#ffffff', 700);
      text('EVENTOS      EXPERIENCIAS      ENTRADAS', 675, 106, 17, '#adc2ec');
      const gradient = c.createLinearGradient(0, 150, 1200, 600);
      gradient.addColorStop(0, '#1749b2'); gradient.addColorStop(1, '#0a1020');
      rect(40, 154, 1200, 400, gradient, 16);
      c.strokeStyle = '#749dff'; c.lineWidth = 2;
      for (let i = 0; i < 12; i++) { c.beginPath(); c.ellipse(930, 355, 60 + i * 16, 70 + i * 14, 0.6, 0, Math.PI * 2); c.stroke(); }
      text("LET'S GO.", 85, 330, 115, '#ffffff', 700);
      text('Tu próximo gran momento empieza aquí.', 90, 394, 25, '#c3d6ff');
      rect(90, 437, 230, 60, '#ffffff', 30); text('Explorar eventos ↗', 115, 475, 22, '#155eef', 700);
      ['Música en vivo', 'Experiencias', 'Momentos únicos'].forEach((label, i) => {
        rect(42 + i * 408, 596, 382, 113, '#17213a', 10);
        text(label, 65 + i * 408, 663, 27, '#e3ecff', 600);
      });
    } else {
      rect(0, 48, 1280, 732, '#edf2fa');
      text('SAN ISIDRO', 60, 119, 32, '#142f5e', 700);
      text('INSTITUTO UNIVERSITARIO', 62, 146, 13, '#526b94', 600);
      text('ESTUDIA CON NOSOTROS      COMUNIDAD', 680, 116, 17, '#42608b');
      rect(40, 188, 1200, 355, '#155eef', 14);
      text('El futuro', 83, 294, 76, '#ffffff', 700);
      text('se construye.', 83, 384, 76, '#ffffff', 700);
      text('Conocimiento que abre nuevas posibilidades.', 87, 456, 24, '#cedfff');
      for (let i = 0; i < 5; i++) rect(865 + i * 59, 420 - i * 40, 44, 123 + i * 40, '#ffffff30');
      text('Explora tu próximo paso', 55, 608, 28, '#142f5e', 700);
      ['Oferta académica', 'Servicios', 'Comunidad'].forEach((label, i) => {
        rect(42 + i * 410, 643, 382, 85, '#ffffff', 10);
        text(label + '  ↗', 67 + i * 410, 696, 25, '#155eef', 600);
      });
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
    return texture;
  }
  const textures = [0, 1, 2, 3].map(makeScreen);
  const displayMaterial = new THREE.MeshBasicMaterial({ map: textures[0], toneMapped: false });
  const display = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 2.925), displayMaterial);
  display.position.set(0, 1.63, 0.089);
  lid.add(display);

  const portal = new THREE.Group();
  scene.add(portal);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(3.65, 0.014, 8, 128), new THREE.MeshBasicMaterial({ color: 0x2468ff, transparent: true, opacity: 0.5 }));
  portal.add(ring);
  const outer = new THREE.Mesh(new THREE.TorusGeometry(3.85, 0.006, 6, 128), new THREE.MeshBasicMaterial({ color: 0x41669c, transparent: true, opacity: 0.3 }));
  portal.add(outer);
  portal.position.set(2.6, 0.25, -3.5);
  portal.rotation.set(0.18, -0.3, 0.2);
  const positions = new Float32Array(110 * 3);
  let seed = 27;
  const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  for (let i = 0; i < positions.length; i += 3) {
    positions[i] = (random() - 0.5) * 20;
    positions[i + 1] = (random() - 0.5) * 13;
    positions[i + 2] = -1 - random() * 8;
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const dust = new THREE.Points(dustGeometry, new THREE.PointsMaterial({ color: 0x70a0ff, size: 0.025, transparent: true, opacity: 0.65 }));
  scene.add(dust);

  let paused = reducedMotion.matches;
  let active = 0;
  let mobile = false;
  let inView = true;
  let previousTime = null;
  let elapsed = 0;
  let sectionCenters = [];
  let mobileVisualCenters = [];
  let sceneEnd = 0;
  const pointer = { x: 0, y: 0 };
  const poses = [
    { x: 2.55, y: 0, rx: 0.1, ry: -0.38, rz: -0.06 },
    { x: 2.65, y: 0, rx: 0.05, ry: -0.2, rz: 0.025 },
    { x: 2.55, y: 0, rx: 0.06, ry: -0.48, rz: -0.08 },
    { x: 2.6, y: 0, rx: 0.04, ry: -0.16, rz: 0.035 },
  ];
  function positionLaptop(snap, delta = 0) {
    const pose = poses[active];
    const blend = snap ? 1 : 1 - Math.exp(-delta * 4);
    const bob = paused ? 0 : Math.sin(elapsed * 0.65) * 0.07;
    const targetX = mobile ? 0 : pose.x;
    const viewHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    const scale = mobile ? Math.min(0.67, viewHeight * camera.aspect / 6.4) : Math.min(1, innerWidth / innerHeight / 1.65);
    const center = (mobileVisualCenters[active] || 650) - scrollY;
    const targetY = mobile ? (0.5 - center / innerHeight) * viewHeight - 0.6 * scale : pose.y;
    laptop.position.x += (targetX - laptop.position.x) * blend;
    laptop.position.y += (targetY + bob - laptop.position.y) * (mobile ? 1 : blend);
    laptop.rotation.x += (pose.rx + (paused ? 0 : pointer.y * 0.06) - laptop.rotation.x) * blend;
    laptop.rotation.y += (pose.ry + (paused ? 0 : pointer.x * 0.1) - laptop.rotation.y) * blend;
    laptop.rotation.z += (pose.rz - laptop.rotation.z) * blend;
    laptop.scale.setScalar(scale);
    portal.position.x = mobile ? 0 : 2.6;
    portal.position.y = mobile ? targetY : 0.25;
  }
  function render(time) {
    const delta = previousTime === null ? 0 : Math.min((time - previousTime) / 1000, 0.05);
    previousTime = time; elapsed += delta;
    positionLaptop(false, delta);
    portal.rotation.z = 0.2 + Math.sin(elapsed * 0.13) * 0.07;
    dust.rotation.y = elapsed * 0.009;
    renderer.render(scene, camera);
  }
  function syncMotion() {
    previousTime = null;
    renderer.setAnimationLoop(!paused && inView && !document.hidden ? render : null);
    toggle.innerHTML = paused ? 'Activar movimiento <span>▷</span>' : 'Pausar movimiento <span>Ⅱ</span>';
    toggle.setAttribute('aria-pressed', String(paused));
    if (paused) positionLaptop(true);
    renderer.render(scene, camera);
  }
  function updateChapter() {
    const middle = scrollY + innerHeight * 0.5;
    let next = 0;
    sectionCenters.forEach((center, index) => {
      if (Math.abs(center - middle) < Math.abs(sectionCenters[next] - middle)) next = index;
    });
    if (next !== active) {
      active = next;
      displayMaterial.map = textures[active];
      chapterLinks.forEach((link, index) => {
        if (index === active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
      document.querySelector('.world-word').textContent = ['CREAR.', 'CONECTAR.', 'VIVIR.', 'CRECER.'][active];
      if (paused) { positionLaptop(true); renderer.render(scene, camera); }
    }
    const nextVisible = scrollY < sceneEnd;
    if (nextVisible !== inView) { inView = nextVisible; syncMotion(); }
    document.querySelector('.chapter-nav').hidden = !inView;
    toggle.hidden = !inView;
    if (paused) { positionLaptop(true); renderer.render(scene, camera); }
  }
  function resize() {
    mobile = innerWidth <= 640;
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.position.set(0, mobile ? 0 : 1.1, mobile ? 12.8 : 11);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    sectionCenters = sections.map(section => section.offsetTop + section.offsetHeight / 2);
    mobileVisualCenters = sections.map(section => {
      const copy = section.querySelector('.chapter-copy');
      return section.offsetTop + copy.offsetTop + copy.offsetHeight + 165;
    });
    sceneEnd = document.querySelector('#perfil').offsetTop;
    positionLaptop(true);
    updateChapter();
    renderer.render(scene, camera);
  }
  addEventListener('resize', resize);
  addEventListener('scroll', updateChapter, { passive: true });
  addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || paused) return;
    pointer.x = event.clientX / innerWidth - 0.5;
    pointer.y = event.clientY / innerHeight - 0.5;
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => { pointer.x = pointer.y = 0; });
  toggle.addEventListener('click', () => { paused = !paused; syncMotion(); });
  reducedMotion.addEventListener('change', () => { paused = reducedMotion.matches; syncMotion(); });
  document.addEventListener('visibilitychange', syncMotion);
  renderer.domElement.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    renderer.setAnimationLoop(null);
    document.body.classList.remove('scene-ready');
    host.hidden = true;
    toggle.hidden = true;
  });
  addEventListener('pagehide', () => renderer.setAnimationLoop(null));
  addEventListener('pageshow', syncMotion);
  await document.fonts.ready;
  document.body.classList.add('scene-ready');
  resize();
  syncMotion();
}

initScene().catch(error => {
  console.warn('La escena 3D no está disponible; se muestran las vistas estáticas.', error);
  document.body.classList.remove('scene-ready');
  host.hidden = true;
  toggle.hidden = true;
});
