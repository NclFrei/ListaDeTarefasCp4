
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";
import { getFirestore,collection,addDoc,getDocs,doc,updateDoc,deleteDoc } from "firebase/firestore";

//Vai pegar o getReactNativePersistence mesmo sem tipagem
const {getReactNativePersistence} = require("firebase/auth") as any

const firebaseConfig = {
  apiKey: "AIzaSyCHs010B2yosXbwP78eCTL8v7SYL3e_geA",
  authDomain: "projetofirebase-dc43b.firebaseapp.com",
  projectId: "projetofirebase-dc43b",
  storageBucket: "projetofirebase-dc43b.firebasestorage.app",
  messagingSenderId: "566689435177",
  appId: "1:566689435177:web:2267636b5904a6ccd11638"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app)

const auth = initializeAuth(app,{
  persistence:getReactNativePersistence(AsyncStorage)
});
export {auth,db,collection,addDoc,getDocs,doc,updateDoc,deleteDoc}