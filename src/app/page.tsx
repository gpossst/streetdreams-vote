"use client";
import { auth, signInWithGoogle } from "@/utils/firebase";
import { useEffect } from "react";
import { useState } from "react";
import { signOut, User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import Upload from "@/components/Upload";
import Vote from "@/components/Vote";
import Progress from "@/components/Home/Progress";
export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [voteState, setVoteState] = useState(0);

  const getVoteState = () => {
    const testDate = new Date("2025-02-1");
    const currentDate = testDate || new Date();
    const currentDay = currentDate.getDate();

    if (currentDay >= 1 && currentDay <= 10) {
      setVoteState(0);
    } else if (currentDay >= 11 && currentDay <= 25) {
      setVoteState(1);
    } else {
      setVoteState(2);
    }
    console.log("vote state: ", voteState);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    getVoteState();
  }, []);

  return (
    <div>
      {isLoading ? (
        <div>Loading...</div>
      ) : user ? (
        <div className="flex flex-col pt-20 items-center h-screen">
          <Progress />
          <div className="absolute flex gap-8 top-0 right-0">
            <h1>{user.displayName}</h1>
            <button onClick={() => signOut(auth)}>Sign out</button>
          </div>
          <Upload voteEnabled={voteState} />
          <Vote voteEnabled={voteState === 1} user={user} />
        </div>
      ) : (
        <button onClick={signInWithGoogle}>Sign in with Google</button>
      )}
    </div>
  );
}
