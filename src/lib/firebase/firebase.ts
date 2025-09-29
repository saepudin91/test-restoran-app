// Import the functions you need from the SDKs you need
//import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { initializeApp, getApps, getApp } from "firebase/app";
//import { getFirestore } from "firebase/firestore";
//import { getStorage } from "firebase/storage";
// import { getAuth } from "firebase/auth"; // Tambahkan jika Anda membuat Login Admin
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAFIIPTdZPWsFjNCyvkuEwKdCzfsfon9d4",
    authDomain: "restoranappmvp.firebaseapp.com",
    projectId: "restoranappmvp",
    storageBucket: "restoranappmvp.firebasestorage.app",
    messagingSenderId: "491916460341",
    appId: "1:491916460341:web:174d432181496f5a218c7c",
    measurementId: "G-JCW4T3MFKB"
};

// Pola Next.js untuk Mencegah Inisialisasi Ganda (Wajib)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// -----------------------------------------------------
// INISIALISASI DAN EXPORT LAYANAN YANG DIBUTUHKAN
// -----------------------------------------------------

// 1. Firestore (Database)
export const db = getFirestore(app);

// 2. Storage (Penyimpanan Foto)
export const storage = getStorage(app);

// 3. Auth (Jika diperlukan)
// export const auth = getAuth(app);

// Catatan: Anda tidak perlu mengekspor 'app' atau 'analytics' kecuali jika dibutuhkan secara spesifik.

// Initialize Firebase
//const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);