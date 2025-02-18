// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
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
    // Configure provider to force vt.edu domain
    provider.setCustomParameters({
      hd: "vt.edu",
    });

    const result = await signInWithPopup(auth, provider);

    // Double-check the email domain as an extra security measure
    if (!result.user.email.endsWith("@vt.edu")) {
      await firebaseSignOut(auth);
      throw new Error("Please use your VT email address to sign in.");
    }

    const userDocRef = doc(db, "users", result.user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      await checkUserTokens();
      return;
    }

    await setDoc(userDocRef, {
      userId: result.user.uid,
      displayName: result.user.displayName,
      votesData: {
        votes: 10,
        lastUpdated: new Date(),
        photoVotes: [],
      },
      competitionData: {
        wins: 0,
        winningImages: [],
      },
    });
  } catch (error) {
    console.error("Error during sign in:", error);
    throw error; // Re-throw the error to handle it in the component
  }
};

export const signOut = () => {
  return firebaseSignOut(auth);
};

export const getUser = () => {
  return auth.currentUser;
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

export const canUploadPhoto = async (userId) => {
  const collectionRef = collection(db, "photos");
  const currentDate = new Date();
  const startOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const endOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );

  const q = query(
    collectionRef,
    where("uploadedBy", "==", userId),
    where("uploadedAt", ">=", Timestamp.fromDate(startOfMonth)),
    where("uploadedAt", "<=", Timestamp.fromDate(endOfMonth))
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.size === 0;
};

export const getUserVotes = async (userId) => {
  const userDocRef = doc(db, "users", userId);
  const userDocSnap = await getDoc(userDocRef);
  if (userDocSnap.exists()) {
    return userDocSnap.data().votesData.votes;
  }
};

export const getMonthPhotos = async () => {
  const collectionRef = collection(db, "photos");
  const currentDate = new Date();
  const startOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const endOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );
  const q = query(
    collectionRef,
    where("uploadedAt", ">=", Timestamp.fromDate(startOfMonth)),
    where("uploadedAt", "<=", Timestamp.fromDate(endOfMonth))
  );
  const querySnapshot = await getDocs(q);
  console.log(querySnapshot.docs.map((doc) => doc.data()));
  return querySnapshot.docs.map((doc) => doc.data());
};

export const getVotes = async (userId) => {
  const userDocRef = doc(db, "users", userId);
  const userDocSnap = await getDoc(userDocRef);
  if (userDocSnap.exists()) {
    const lastUpdated = userDocSnap.data().votesData.lastUpdated.toDate();
    const currentDate = new Date();
    if (
      lastUpdated.getFullYear() === currentDate.getFullYear() &&
      lastUpdated.getMonth() === currentDate.getMonth()
    ) {
      return userDocSnap.data().votesData.photoVotes;
    }
    return [];
  }
};

export const submitVotes = async (userId, votes) => {
  const userDocRef = doc(db, "users", userId);
  await updateDoc(userDocRef, {
    "votesData.photoVotes": votes,
    "votesData.lastUpdated": new Date(),
  });
};

export const getTopVotedPhotos = async () => {
  // Get all users
  const usersRef = collection(db, "users");
  const usersSnapshot = await getDocs(usersRef);

  // Create a map to store total votes for each photo
  const photoVotesMap = {};

  // Iterate through each user
  usersSnapshot.forEach((userDoc) => {
    const userData = userDoc.data();
    const photoVotes = userData.votesData?.photoVotes || [];

    // Add each vote to the total
    photoVotes.forEach((photoId) => {
      photoVotesMap[photoId] = (photoVotesMap[photoId] || 0) + 1;
    });
  });

  // Convert the map to an array of [photoId, votes] pairs
  const photoVotesArray = Object.entries(photoVotesMap);

  // Sort the array by votes in descending order
  photoVotesArray.sort((a, b) => b[1] - a[1]);

  // Get the top 3 photos
  const topThreePhotos = photoVotesArray.slice(0, 3);

  return topThreePhotos;
};
