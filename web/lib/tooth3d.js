/* ==========================================================================
   Clínica Vitalis — tooth3d.js
   Ilha WebGL (three.js) carregada sob demanda. Dente procedural estilizado,
   sem assets externos. Exposta via mountTooth3D(el).
   ========================================================================== */
import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  HemisphereLight,
  DirectionalLight,
  PMREMGenerator,
  CanvasTexture,
  EquirectangularReflectionMapping,
  SRGBColorSpace,
  ACESFilmicToneMapping,
  Shape,
  ExtrudeGeometry,
  MeshPhysicalMaterial,
  Mesh,
  Group,
  Color,
} from "three";

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

function envTexture() {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext("2d");
  const g = ctx.createLinearGradient(0, 0, 0, 64);
  g.addColorStop(0, "#ffffff");
  g.addColorStop(0.55, "#e8fbf7");
  g.addColorStop(1, "#8fd9cf");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new CanvasTexture(c);
  tex.mapping = EquirectangularReflectionMapping;
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

export function mountTooth3D(root) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const canvas = document.createElement("canvas");
  canvas.className = "tooth3d__canvas";
  canvas.setAttribute("aria-hidden", "true");
  root.appendChild(canvas);

  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "low-power",
    preserveDrawingBuffer: window.__VITALIS_3D_TEST__ === true,
  });
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new Scene();
  const camera = new PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0.12, 6.6);

  /* --- Luzes ------------------------------------------------------------- */
  scene.add(new HemisphereLight(0xffffff, 0xb9d8d4, 0.9));
  const key = new DirectionalLight(0xffffff, 2.2);
  key.position.set(3.5, 4, 4);
  scene.add(key);
  const rim = new DirectionalLight(0xa7f3d0, 1.1);
  rim.position.set(-4, 1.5, -3);
  scene.add(rim);
  const fill = new DirectionalLight(0xffffff, 0.5);
  fill.position.set(-3, -2, 2);
  scene.add(fill);

  /* --- Ambiente (reflexos suaves sem asset externo) ---------------------- */
  const pmrem = new PMREMGenerator(renderer);
  const envTex = envTexture();
  const envRT = pmrem.fromEquirectangular(envTex);
  scene.environment = envRT.texture;
  envTex.dispose();
  pmrem.dispose();

  /* --- Dente procedural -------------------------------------------------- */
  const shape = new Shape();
  shape.moveTo(0, -1.72);
  shape.bezierCurveTo(0.28, -1.2, 0.3, -0.7, 0.34, -0.32);
  shape.bezierCurveTo(0.42, 0.05, 0.94, 0.06, 0.96, 0.42);
  shape.bezierCurveTo(0.98, 0.78, 0.78, 1.08, 0.48, 1.12);
  shape.bezierCurveTo(0.3, 1.15, 0.2, 0.98, 0, 0.98);
  shape.bezierCurveTo(-0.2, 0.98, -0.3, 1.15, -0.48, 1.12);
  shape.bezierCurveTo(-0.78, 1.08, -0.98, 0.78, -0.96, 0.42);
  shape.bezierCurveTo(-0.94, 0.06, -0.42, 0.05, -0.34, -0.32);
  shape.bezierCurveTo(-0.3, -0.7, -0.28, -1.2, 0, -1.72);
  shape.closePath();

  const geo = new ExtrudeGeometry(shape, {
    depth: 1.0,
    curveSegments: 26,
    bevelEnabled: true,
    bevelThickness: 0.2,
    bevelSize: 0.2,
    bevelSegments: 7,
  });
  geo.center();

  const mat = new MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.22,
    metalness: 0.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.14,
    sheen: 0.5,
    sheenColor: new Color(0xbef7ee),
    envMapIntensity: 1.2,
  });
  const mesh = new Mesh(geo, mat);

  const group = new Group();
  group.add(mesh);
  scene.add(group);

  /* --- Estado / interação ------------------------------------------------ */
  const st = { spin: 0, auto: 0.0042, parallaxX: 0, parallaxY: 0, curX: 0, curY: 0, dragging: false, lastX: 0, lastY: 0, t: 0 };

  function onPointerMove(e) {
    const r = root.getBoundingClientRect();
    if (!r.width) return;
    if (st.dragging) {
      const dx = e.clientX - st.lastX;
      const dy = e.clientY - st.lastY;
      st.lastX = e.clientX;
      st.lastY = e.clientY;
      st.spin += dx * 0.01;
      st.parallaxY = clamp(st.parallaxY + dy * 0.006, -0.5, 0.5);
      return;
    }
    st.parallaxX = ((e.clientX - r.left) / r.width - 0.5) * 0.55;
    st.parallaxY = ((e.clientY - r.top) / r.height - 0.5) * 0.4;
  }
  function onPointerLeave() {
    if (st.dragging) return;
    st.parallaxX = 0;
    st.parallaxY = 0;
  }
  function onPointerDown(e) {
    st.dragging = true;
    st.lastX = e.clientX;
    st.lastY = e.clientY;
    root.classList.add("is-grabbing");
    if (root.setPointerCapture) root.setPointerCapture(e.pointerId);
  }
  function onPointerUp() {
    st.dragging = false;
    root.classList.remove("is-grabbing");
  }

  /* --- Render ------------------------------------------------------------ */
  let running = false;
  let raf = 0;
  let visible = false;

  function frame() {
    if (!running) return;
    st.t += 0.016;
    st.spin += st.auto;
    st.curX += (st.parallaxX - st.curX) * 0.06;
    st.curY += (st.parallaxY - st.curY) * 0.06;
    group.rotation.y = st.spin + st.curX;
    group.rotation.x = st.curY;
    mesh.position.y = Math.sin(st.t * 1.1) * 0.06;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }
  function start() {
    if (reducedMotion || running) return;
    running = true;
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  function resize() {
    const w = root.clientWidth;
    const h = root.clientHeight;
    if (!w || !h) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  }

  const ro = new ResizeObserver(resize);
  ro.observe(root);

  const io = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !document.hidden) start();
      else stop();
    },
    { rootMargin: "140px 0px" }
  );
  io.observe(root);

  function onVis() {
    if (document.hidden) stop();
    else if (visible) start();
  }

  root.addEventListener("pointermove", onPointerMove);
  root.addEventListener("pointerleave", onPointerLeave);
  root.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointerup", onPointerUp);
  document.addEventListener("visibilitychange", onVis);

  resize();
  root.classList.add("is-ready");
  if (reducedMotion) renderer.render(scene, camera);

  return {
    destroy() {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerleave", onPointerLeave);
      root.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      geo.dispose();
      mat.dispose();
      envRT.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
}