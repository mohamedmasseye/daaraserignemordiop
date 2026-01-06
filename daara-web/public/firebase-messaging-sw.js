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
// Gestion des messages en arrière-plan
messaging.onBackgroundMessage((payload) => {
  console.log('Message reçu :', payload);

  // Si le message contient déjà une notification gérée par le système, 
  // on ne force pas l'affichage manuel pour éviter les doublons.
  if (payload.notification && !payload.data?.manual) {
    return; 
  }

  const notificationTitle = payload.notification?.title || "Nouveau message";
  const notificationOptions = {
    body: payload.notification?.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});