importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyDcBu_ebg9PHPW2Yzq4rdMymsEmcLdCAHA",
  authDomain: "daara-app-5a679.firebaseapp.com",
  projectId: "daara-app-5a679",
  storageBucket: "daara-app-5a679.firebasestorage.app",
  messagingSenderId: "1060878832216",
  appId: "1:1060878832216:web:1e26ab2371dfff293d702d"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Réception en arrière-plan
messaging.onBackgroundMessage((payload) => {
  if (payload.notification) return; 

  const notificationTitle = payload.data?.title || "Annonce Daara";
  const notificationOptions = {
    body: payload.data?.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: { url: payload.data?.url || '/' } // ✅ Stocke l'URL de redirection
  };
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// ✅ GESTION DU CLIC POUR REDIRIGER VERS /evenements
// public/firebase-messaging-sw.js

// public/firebase-messaging-sw.js

// public/firebase-messaging-sw.js

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || 'https://app.daaraserignemordiop.com/evenements';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // 1. Si l'app est déjà ouverte
      for (let client of windowClients) {
        if ('focus' in client) {
          client.focus();
          // On envoie un message interne à React au cas où la navigation échouerait
          client.postMessage({ type: 'FORCE_REDIRECT', url: targetUrl });
          return client.navigate(targetUrl);
        }
      }
      // 2. Si l'app est fermée
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});