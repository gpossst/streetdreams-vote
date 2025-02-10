import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { adminAuth } from "@/utils/firebase-admin";

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
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.url);
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
