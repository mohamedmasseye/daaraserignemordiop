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

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // 1. Récupérer l'URL envoyée par l'admin
  const relativeUrl = event.notification.data?.url || '/evenements';
  
  // 2. Construire l'URL complète (obligatoire pour iOS)
  // Cela transformera "/evenements?id=..." en "https://app.daaraserignemordiop.com/evenements?id=..."
  const targetUrl = new URL(relativeUrl, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Si une fenêtre est déjà ouverte, on la focus et on change son adresse
      for (let client of windowClients) {
        if ('focus' in client && 'navigate' in client) {
          return client.focus().then(() => client.navigate(targetUrl));
        }
      }
      // Sinon, on ouvre une nouvelle fenêtre sur la bonne page
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});