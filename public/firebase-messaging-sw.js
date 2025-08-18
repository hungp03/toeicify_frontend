self.importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
self.importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBfYBJHjSDTU8u7y0KkySsSivY_r1NiJZ8",
  authDomain: "toeic-cloud.firebaseapp.com",
  databaseURL: "https://toeic-cloud-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "toeic-cloud",
  storageBucket: "toeic-cloud.firebasestorage.app",
  messagingSenderId: "802399618331",
  appId: "1:802399618331:web:ea7469300f630df4c3ffbe",
  measurementId: "G-3VSQMRZNRX"
});

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