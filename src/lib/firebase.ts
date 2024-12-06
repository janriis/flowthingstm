import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAwp6q0Tbc79JX8B1waSqPXTrq7P3iDdSg",
  authDomain: "flowthingstm.firebaseapp.com",
  databaseURL: "https://flowthingstm-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "flowthingstm",
  storageBucket: "flowthingstm.firebasestorage.app",
  messagingSenderId: "387567192836",
  appId: "1:387567192836:web:db6bc9fbd8c6e2767e1e51"
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);
export const storage = getStorage(app);