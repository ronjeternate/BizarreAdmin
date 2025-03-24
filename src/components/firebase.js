import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCU4NBngSOqz1b80YttGZPq11sL-kGoSig",
    authDomain: "bizarreadventure-ba84a.firebaseapp.com",
    projectId: "bizarreadventure-ba84a",
    storageBucket: "bizarreadventure-ba84a.appspot.com", 
    messagingSenderId: "464053523281",
    appId: "1:464053523281:web:13fa96e7813c7323397970",
    measurementId: "G-EVC79ELRR7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
