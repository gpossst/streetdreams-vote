"use client";
import { auth, signInWithGoogle } from "@/utils/firebase";
import { useEffect } from "react";
import { useState } from "react";
import { signOut, User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import Upload from "@/components/Upload";
import Vote from "@/components/Vote";
import Progress from "@/components/Home/Progress";
import Results from "@/components/Results";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [voteState, setVoteState] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const getVoteState = () => {
      const currentDate = new Date();
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
    getVoteState();
  }, [voteState]);

  return (
    <div>
      {isLoading ? (
        <div>Loading...</div>
      ) : user ? (
        <div className="flex flex-col pt-20 items-center h-screen">
          <Progress />
          <div className="absolute items-center flex gap-2 md:flex-col top-4 right-4">
            <h1>{user.displayName}</h1>
            <button
              className="bg-foreground text-sm text-background rounded-md p-2"
              onClick={() => signOut(auth)}
            >
              Sign out
            </button>
          </div>
          <Upload voteEnabled={voteState} />
          <Vote voteEnabled={voteState} user={user} />
          <Results voteEnabled={voteState} />
        </div>
      ) : (
        <div className="flex flex-col gap-4 pt-20 items-center justify-center pb-20 h-screen">
          <div className="flex flex-col gap-2 items-center text-center">
            <h1 className="text-2xl font-bold">
              Welcome to the Virginia Tech Photography Club&apos;s Monthly Photo
              Contest!
            </h1>
            <h3 className="text-lg">
              Please sign in to upload photos and vote for your favorite photos.
            </h3>
          </div>
          <button
            className="bg-foreground text-sm text-background rounded-md p-2"
            onClick={signInWithGoogle}
          >
            Sign in with Google
          </button>
        </div>
      )}
    </div>
  );
}
