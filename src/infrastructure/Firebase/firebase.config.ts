// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCcc-3w6m2pL1j35VNwk-6dfSTYsgAzfEc",
    authDomain: "spotify-firebase-ab44c.firebaseapp.com",
    projectId: "spotify-firebase-ab44c",
    storageBucket: "spotify-firebase-ab44c.firebasestorage.app",
    messagingSenderId: "795064702288",
    appId: "1:795064702288:web:73581186251248491e4855",
    measurementId: "G-6QHNL3P0GF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);
export default app;

const analytics = getAnalytics(app);