import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { adminAuth } from "@/utils/firebase-admin";
import { db } from "@/utils/firebase";
import { doc, setDoc } from "firebase/firestore";
import { canUploadPhoto } from "@/utils/firebase";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const authHeader = req.headers.get("authorization");
      if (!authHeader) throw new UploadThingError("Unauthorized");

      try {
        const token = authHeader.replace("Bearer ", "");
        if (!token) throw new UploadThingError("No token provided");

        const decodedToken = await adminAuth.verifyIdToken(token);
        return { userId: decodedToken.uid };
      } catch (error) {
        console.error("Auth error:", error);
        throw new UploadThingError("Invalid token");
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const canUpload = await canUploadPhoto(metadata.userId);
      if (!canUpload) return;
      const userDocRef = doc(db, "photos", file.key);
      await setDoc(userDocRef, {
        fileKey: file.key,
        fileName: file.name,
        fileUrl: file.url,
        uploadedBy: metadata.userId,
        uploadedAt: new Date(),
        votes: 0,
      });
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
