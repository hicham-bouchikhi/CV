import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export function mountScene(shell: HTMLElement): () => void {
  const host = shell.querySelector<HTMLElement>('[data-scene-host]');
  const button = document.querySelector<HTMLButtonElement>('[data-motion-toggle]');
  if (!host) return () => {};

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch {
    return () => {};
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 760 ? 1.25 : 1.75));
  renderer.setClearColor(0x101112, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  host.append(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, .1, 50);
  camera.position.set(0, 0, 7.7);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, .04);
  scene.environment = environment.texture;
  room.dispose();
  pmrem.dispose();

  const group = new THREE.Group();
  scene.add(group);
  const geometry = new THREE.TorusKnotGeometry(1.02, .29, 144, 20, 2, 3);
  const metal = new THREE.MeshStandardMaterial({ color:0x84909e, metalness:1, roughness:.19, envMapIntensity:1.7 });
  const knot = new THREE.Mesh(geometry, metal);
  knot.rotation.set(.3,-.4,0);
  group.add(knot);

  const ringGeometry = new THREE.TorusGeometry(1.85, .007, 6, 160);
  const ringMaterial = new THREE.MeshBasicMaterial({color:0xff7043, transparent:true,opacity:.7});
  const ring = new THREE.Mesh(ringGeometry,ringMaterial);
  ring.rotation.set(1.1,.55,.3);
  group.add(ring);
  const secondRing = new THREE.Mesh(ringGeometry,ringMaterial);
  secondRing.rotation.set(.2,1.15,-.4);
  group.add(secondRing);
  const pointGeometry = new THREE.IcosahedronGeometry(.055,0);
  const pointMaterial = new THREE.MeshBasicMaterial({color:0xff7043});
  const point = new THREE.Mesh(pointGeometry,pointMaterial);
  point.position.set(1.85,0,0);
  group.add(point);

  const warm = new THREE.DirectionalLight(0xff7445,7);
  warm.position.set(3,1,-1);
  const cool = new THREE.DirectionalLight(0xc5d8ff,4);
  cool.position.set(-3,3,3);
  const rim = new THREE.DirectionalLight(0xffffff,2);
  rim.position.set(1,-3,2);
  scene.add(warm,cool,rim);

  let visible = false;
  let userPaused = false;
  let disposed = false;
  let frame = 0;
  let elapsed = 0;
  let previous = 0;
  let targetX = 0;
  let targetY = 0;
  let lastPaint = 0;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const hero = shell.closest<HTMLElement>('.hero') ?? shell;

  function resize() {
    if (disposed) return;
    const {width,height} = host!.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width,height);
    camera.aspect = width/height;
    camera.updateProjectionMatrix();
    renderer.render(scene,camera);
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);

  function paint(now: number) {
    frame = 0;
    if (disposed || !visible || document.hidden || userPaused || reduced.matches) return;
    if (previous) elapsed += Math.min((now-previous)/1000,.1);
    previous = now;
    // A 30 fps ceiling keeps the decorative scene quiet on battery-powered devices.
    if (now-lastPaint >= 32) {
      lastPaint = now;
      knot.rotation.y = -.4 + elapsed*.12;
      knot.rotation.x = .3 + Math.sin(elapsed*.2)*.12;
      group.rotation.y += (targetX*.28-group.rotation.y)*.055;
      group.rotation.x += (targetY*.18-group.rotation.x)*.055;
      ring.rotation.z = .3 + elapsed*.06;
      secondRing.rotation.z = -.4 - elapsed*.04;
      point.position.set(Math.cos(elapsed*.32)*1.85,Math.sin(elapsed*.32)*1.1,Math.sin(elapsed*.32)*.7);
      renderer.render(scene,camera);
    }
    frame = requestAnimationFrame(paint);
  }
  function synchronize() {
    cancelAnimationFrame(frame);
    frame = 0;
    previous = 0;
    if (!disposed && visible && !document.hidden && !userPaused && !reduced.matches) frame=requestAnimationFrame(paint);
  }
  const observer = new IntersectionObserver(([entry]) => {visible=entry.isIntersecting;synchronize();});
  observer.observe(shell);
  function pointer(event:PointerEvent) {
    if (event.pointerType !== 'mouse') return;
    const box=hero.getBoundingClientRect();
    targetX=(event.clientX-box.left)/box.width*2-1;
    targetY=(event.clientY-box.top)/box.height*2-1;
  }
  function resetPointer() {targetX=targetY=0;}
  function toggle() {
    userPaused=!userPaused;
    if(button){button.setAttribute('aria-pressed',String(userPaused));button.textContent=userPaused?button.dataset.resume!:button.dataset.pause!;}
    synchronize();
  }
  function motionPreference() {
    if(reduced.matches){shell.classList.remove('is-ready');if(button)button.hidden=true;}
    else {shell.classList.add('is-ready');if(button)button.hidden=false;}
    synchronize();
  }
  function onContextLost(event:Event) { event.preventDefault(); dispose(); }
  function dispose() {
    if(disposed)return;
    disposed=true;
    cancelAnimationFrame(frame);
    observer.disconnect();resizeObserver.disconnect();
    hero.removeEventListener('pointermove',pointer);
    hero.removeEventListener('pointerleave',resetPointer);
    document.removeEventListener('visibilitychange',synchronize);
    reduced.removeEventListener('change',motionPreference);
    button?.removeEventListener('click',toggle);
    renderer.domElement.removeEventListener('webglcontextlost',onContextLost);
    geometry.dispose();metal.dispose();ringGeometry.dispose();ringMaterial.dispose();pointGeometry.dispose();pointMaterial.dispose();
    environment.dispose();renderer.dispose();renderer.domElement.remove();
    shell.classList.remove('is-ready');
    if(button)button.hidden=true;
  }
  hero.addEventListener('pointermove',pointer,{passive:true});
  hero.addEventListener('pointerleave',resetPointer);
  document.addEventListener('visibilitychange',synchronize);
  reduced.addEventListener('change',motionPreference);
  button?.addEventListener('click',toggle);
  renderer.domElement.addEventListener('webglcontextlost',onContextLost);
  resize();motionPreference();
  return dispose;
}
