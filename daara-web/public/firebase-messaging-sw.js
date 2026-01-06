// Importation des scripts Firebase (Version Compat pour Service Worker)
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Configuration Firebase
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

// Gestion des messages en arrière-plan
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Message reçu en arrière-plan :', payload);

  // N'affiche la notification que si elle n'est pas déjà gérée par FCM (évite les doublons)
  if (payload.notification) {
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: {
        url: payload.data?.url || '/'
      }
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
  }
});