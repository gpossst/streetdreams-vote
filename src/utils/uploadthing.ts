import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

export const { useUploadThing, uploadFiles } =
  generateReactHelpers<OurFileRouter>();

// Add this type declaration to allow headers in the config
declare module "@uploadthing/react" {
  interface UploadthingConfig {
    headers?: {
      Authorization: string;
    };
  }
}
