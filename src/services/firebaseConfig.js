import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyA9ci3DVb7pjjBgc_mPFV4SPZsWJ8yheMc",
    authDomain: "listai-210cf.firebaseapp.com",
    projectId: "listai-210cf",
    storageBucket: "listai-210cf.firebasestorage.app",
    messagingSenderId: "339099543831",
    appId: "1:339099543831:web:7971d1f391e952c0786f52"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta o banco de dados para usarmos nas outras telas
export const db = getFirestore(app);