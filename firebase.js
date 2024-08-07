import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";



const firebaseConfig = {
    apiKey: "AIzaSyC8torN-sgkeRwfVDa6ysOW8dyavFNWP0w",
    authDomain: "pantry-app-9eb3c.firebaseapp.com",
    projectId: "pantry-app-9eb3c",
    storageBucket: "pantry-app-9eb3c.appspot.com",
    messagingSenderId: "439349356634",
    appId: "1:439349356634:web:fde98db3228b8e21635063"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const firestore = getFirestore(app)
export {app, firestore}