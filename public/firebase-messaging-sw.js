self.importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
self.importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  // self.registration.showNotification(payload.notification.title, {
  //   body: payload.notification.body,
  //   icon: '/icon.png',
  // });
  self.registration.showNotification(payload.data.title, {
    body: payload.data.body,
  });
});