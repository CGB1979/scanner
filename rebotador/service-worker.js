const VERSION=new URL(self.location.href).searchParams.get('v')||'1.0.1.c';
const CACHE_NAME=`rebotador-${VERSION}`;
const APP_ASSETS=['./','./index.html','./css/estilos.css','./js/configuracionExcel.js','./js/configuracion.js','./js/vehiculos.js','./js/scanner.js','./js/ubicaciones.js','./js/exportacion.js','./js/version.js','./js/app.js','./img/icon-192.png','./img/icon-512.png','./manifest.json'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(APP_ASSETS)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('rebotador-')&&k!==CACHE_NAME).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(r=>{if(r&&r.status===200&&r.type==='basic'){const c=r.clone();caches.open(CACHE_NAME).then(x=>x.put(e.request,c));}return r;}).catch(()=>caches.match(e.request)));});const CACHE_NAME = "rebotador-1.0.1.e";

const BASE_PATH = "/scanner/rebotador/";

const FILES_TO_CACHE = [
    BASE_PATH,
    BASE_PATH + "index.html",

    BASE_PATH + "manifest.json",

    BASE_PATH + "css/estilos.css",

    BASE_PATH + "js/configuracionExcel.js",
    BASE_PATH + "js/configuracion.js",
    BASE_PATH + "js/vehiculos.js",
    BASE_PATH + "js/scanner.js",
    BASE_PATH + "js/ubicaciones.js",
    BASE_PATH + "js/exportacion.js",
    BASE_PATH + "js/version.js",
    BASE_PATH + "js/app.js",

    "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js",
    "https://unpkg.com/html5-qrcode"
];


self.addEventListener("install", event => {

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(FILES_TO_CACHE))
            .then(() => self.skipWaiting())
    );

});


self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys()
            .then(keys => {

                return Promise.all(

                    keys
                        .filter(key =>
                            key.startsWith("rebotador-") &&
                            key !== CACHE_NAME
                        )
                        .map(key =>
                            caches.delete(key)
                        )

                );

            })
            .then(() => self.clients.claim())

    );

});


self.addEventListener("fetch", event => {

    if (event.request.method !== "GET") {
        return;
    }


    event.respondWith(

        caches.match(event.request)

            .then(cachedResponse => {

                if (cachedResponse) {
                    return cachedResponse;
                }


                return fetch(event.request)

                    .then(networkResponse => {

                        if (
                            !networkResponse ||
                            networkResponse.status !== 200
                        ) {
                            return networkResponse;
                        }


                        const responseClone =
                            networkResponse.clone();


                        caches.open(CACHE_NAME)

                            .then(cache => {

                                cache.put(
                                    event.request,
                                    responseClone
                                );

                            });


                        return networkResponse;

                    });

            })

    );

});
