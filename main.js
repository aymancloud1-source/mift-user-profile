// ----------------------
// Firebase Configuration
// ----------------------
const firebaseConfig = {
  apiKey: "AIzaSyCjEidXDDCx511IjaUFtClI6vEVYShjE0U",
  authDomain: "mift-user-profile.firebaseapp.com",
  projectId: "mift-user-profile",
  storageBucket: "mift-user-profile.firebasestorage.app",
  messagingSenderId: "263537598178",
  appId: "1:263537598178:web:ade168e9ca1b3ab54188bb",
  measurementId: "G-GQKEKZYZHY"
};

// Initialize Firebase (Compat)
firebase.initializeApp(firebaseConfig);

// Optional: Analytics
if (firebase.analytics) {
    firebase.analytics();
}

const auth = firebase.auth();
const db = firebase.firestore();
