"use client";
import { auth, signInWithGoogle } from "@/utils/firebase";
import { useEffect } from "react";
import { useState } from "react";
import { signOut, User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import Upload from "@/components/Upload";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div>
      {isLoading ? (
        <div>Loading...</div>
      ) : user ? (
        <div>
          <h1>Welcome, {user.displayName}</h1>
          <button onClick={() => signOut(auth)}>Sign out</button>
          <Upload />
        </div>
      ) : (
        <button onClick={signInWithGoogle}>Sign in with Google</button>
      )}
    </div>
  );
}
