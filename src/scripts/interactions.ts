const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const revealElements = document.querySelectorAll<HTMLElement>('[data-reveal]');
let disposeScene: (() => void) | undefined;

if (!reduced.matches && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('motion-ready');
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}});
  },{threshold:.08});
  revealElements.forEach(element=>observer.observe(element));
  const showAll=()=>{if(reduced.matches){document.documentElement.classList.remove('motion-ready');observer.disconnect();}};
  reduced.addEventListener('change',showAll);
  window.addEventListener('pagehide',()=>{document.documentElement.classList.remove('motion-ready');observer.disconnect();reduced.removeEventListener('change',showAll);},{once:true});
}

const shell=document.querySelector<HTMLElement>('[data-scene]');
let tornDown=false;
async function loadScene(){
  if(!shell || reduced.matches || tornDown)return;
  try {
    const {mountScene}=await import('./scene');
    if(!tornDown)disposeScene=mountScene(shell);
  } catch { /* The static fallback remains visible if the GPU or module is unavailable. */ }
}
if(shell){
  const lazyScene=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){lazyScene.disconnect();void loadScene();}},{rootMargin:'150px'});
  lazyScene.observe(shell);
  window.addEventListener('pagehide',()=>{tornDown=true;lazyScene.disconnect();disposeScene?.();});
  // pagehide cleans GPU resources even for bfcache; a restored page gets a fresh scene.
  window.addEventListener('pageshow',event=>{if(event.persisted){tornDown=false;void loadScene();}});
}
