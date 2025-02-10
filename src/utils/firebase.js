// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
} from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAPw45m6dCjiKK5VLVA7a1pWWRnPbf77-0",
  authDomain: "streetdreams-vt.firebaseapp.com",
  projectId: "streetdreams-vt",
  storageBucket: "streetdreams-vt.firebasestorage.app",
  messagingSenderId: "511367081936",
  appId: "1:511367081936:web:f16e8a8953ec7216ddd3d5",
};

// Initialize Firebase
export const firebase = initializeApp(firebaseConfig);

const auth = getAuth(firebase);
const db = getFirestore(firebase);
const storage = getStorage(firebase);
const provider = new GoogleAuthProvider();

export { auth, db, storage };

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const userDocRef = doc(db, "users", result.user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      await checkUserTokens();
      return;
    }

    await setDoc(userDocRef, {
      votesData: {
        votes: 10,
        lastUpdated: new Date(),
      },
      userId: result.user.uid,
    });
  } catch (error) {
    console.error("Error during sign in:", error);
  }
};

export const signOut = () => {
  return firebaseSignOut(auth);
};

export const checkUserTokens = async () => {
  const user = auth.currentUser;
  if (!user) {
    return false;
  }
  const userDocRef = doc(db, "users", user.uid);
  const userDocSnap = await getDoc(userDocRef);
  if (userDocSnap.exists()) {
    const userData = userDocSnap.data();
    const votesData = userData.votesData;
    const lastUpdated = votesData.lastUpdated.toDate();
    const currentDate = new Date();

    const isNewMonth =
      lastUpdated.getMonth() !== currentDate.getMonth() ||
      lastUpdated.getFullYear() !== currentDate.getFullYear();

    if (isNewMonth) {
      await setDoc(userDocRef, {
        votesData: {
          votes: 10,
          lastUpdated: new Date(),
        },
      });
      return true;
    }
  }
  return false;
};
