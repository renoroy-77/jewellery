importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  projectId: "aamadappetti-sanctum",
  appId: "1:57338864137:web:6320eb28ecfb7f04f74ed8",
  storageBucket: "aamadappetti-sanctum.firebasestorage.app",
  apiKey: "AIzaSyB5QasAj_7UvfrRnqCVArVuLJCYMRzznIs",
  authDomain: "aamadappetti-sanctum.firebaseapp.com",
  messagingSenderId: "57338864137"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || '🪔 Sacred Sanctum Alert';
  const notificationOptions = {
    body: payload.notification?.body || 'New Sanctum notification',
    icon: payload.notification?.imageUrl || '/assets/brand_logo_gold.png',
    badge: '/favicon.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
