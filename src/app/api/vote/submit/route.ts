import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userId, votesSubmitted } = await request.json();

    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, {
      "votesData.photoVotes": votesSubmitted,
    });

    return NextResponse.json(
      {
        message: "Success",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
