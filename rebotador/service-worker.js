const VERSION=new URL(self.location.href).searchParams.get('v')||'1.0.1.c';
const CACHE_NAME=`rebotador-${VERSION}`;
const APP_ASSETS=['./','./index.html','./css/estilos.css','./js/configuracionExcel.js','./js/configuracion.js','./js/vehiculos.js','./js/scanner.js','./js/ubicaciones.js','./js/exportacion.js','./js/version.js','./js/app.js','./img/icon-192.png','./img/icon-512.png','./manifest.json'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(APP_ASSETS)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('rebotador-')&&k!==CACHE_NAME).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(r=>{if(r&&r.status===200&&r.type==='basic'){const c=r.clone();caches.open(CACHE_NAME).then(x=>x.put(e.request,c));}return r;}).catch(()=>caches.match(e.request)));});