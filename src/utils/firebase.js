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
  console.log("signing in with google");
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
  const userDocRef = doc(db, "voteStats", userId);
  const userDocSnap = await getDoc(userDocRef);
  if (userDocSnap.exists()) {
    const lastUpdated = userDocSnap.data().lastUpdated.toDate();
    const currentDate = new Date();
    if (
      lastUpdated.getFullYear() === currentDate.getFullYear() &&
      lastUpdated.getMonth() === currentDate.getMonth()
    ) {
      return userDocSnap.data().votes;
    }
  }
  return [];
};

export const submitVotes = async (userId, votes) => {
  // Update public vote counts
  const votesRef = doc(db, "voteStats", userId);
  await setDoc(
    votesRef,
    { votes, lastUpdated: new Date(), userId },
    { merge: true }
  );
};

export const getTopVotedPhotos = async () => {
  const votesRef = collection(db, "voteStats");
  const votesSnapshot = await getDocs(votesRef);

  // Create a map to sum up all votes for each photo
  const totalVotes = {};

  // Iterate through all documents in voteStats
  votesSnapshot.forEach((doc) => {
    const votes = doc.data().votes || {};
    // Sum up votes for each photo
    Object.entries(votes).forEach(([photoId, voteCount]) => {
      totalVotes[photoId] = (totalVotes[photoId] || 0) + voteCount;
    });
  });

  // Convert to array and sort by vote count
  const photoVotesArray = Object.entries(totalVotes);
  photoVotesArray.sort((a, b) => b[1] - a[1]);

  // Get top 3 photo IDs and their votes
  const top3 = photoVotesArray.slice(0, 3);

  // Fetch the actual photo objects
  const photosWithVotes = await Promise.all(
    top3.map(async ([fileKey, votes]) => {
      const photoRef = doc(db, "photos", fileKey);
      const photoDoc = await getDoc(photoRef);
      if (photoDoc.exists()) {
        return {
          photo: photoDoc.data(),
          votes: votes,
        };
      }
      return null;
    })
  );

  // Filter out any null values in case some photos weren't found
  return photosWithVotes.filter((item) => item !== null);
};

export const getUserNameById = async (userId) => {
  const userDocRef = doc(db, "users", userId);
  const userDocSnap = await getDoc(userDocRef);
  return userDocSnap.data().displayName;
};
