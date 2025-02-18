"use client";
import React, { useEffect, useState } from "react";
import imageCompression from "browser-image-compression";
import { uploadFiles } from "@/utils/uploadthing";
import { auth } from "@/utils/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { canUploadPhoto } from "@/utils/firebase";
import { FaCloudUploadAlt } from "react-icons/fa";

export default function Upload({ voteEnabled }: { voteEnabled: number }) {
  const [user, setUser] = useState<User | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [canUpload, setCanUpload] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        canUploadPhoto(user.uid).then((canUpload) => {
          setCanUpload(canUpload);
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const compressImage = async (file: File) => {
    const options = {
      maxSizeMB: 1, // Max file size in MB
      maxWidthOrHeight: 1920, // Max width/height in pixels
      useWebWorker: true, // Use web worker for better performance
      fileType: "image/webp", // Convert to WebP
    };

    try {
      setIsCompressing(true);
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error("Error compressing image:", error);
      throw error;
    } finally {
      setIsCompressing(false);
    }
  };

  const handleUpload = async () => {
    if (!file || !user) {
      alert("Please select a file to upload and ensure you're logged in");
      return;
    }

    try {
      const token = await user.getIdToken();
      const compressedFile = await compressImage(file);
      console.log("Original size:", file.size / 1024 / 1024, "MB");
      console.log("Compressed size:", compressedFile.size / 1024 / 1024, "MB");

      const uploadResult = await uploadFiles("imageUploader", {
        files: [compressedFile],
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Upload result:", uploadResult);
      setFile(null);
      setCanUpload(false);
    } catch (error) {
      console.error("Error processing image:", error);
      alert("Error processing image");
    }
  };

  return voteEnabled === 0 ? (
    <div className="flex items-center bg-background justify-center w-full max-w-md mx-auto p-6 space-y-4">
      {canUpload ? (
        <div className="flex w-full">
          <label className="bg-foreground cursor-pointer flex hover:bg-[#2A2B32] flex-1 justify-between items-center rounded-l-lg p-4 transition-colors duration-300">
            <FaCloudUploadAlt className="text-2xl text-background" />

            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {file ? (
              <div className="text-sm flex items-center gap-2 px-4 text-end text-background">
                <div>Selected:</div>
                <div>{file.name}</div>
              </div>
            ) : (
              <span className="text-sm text-end text-background">
                Select a photo
              </span>
            )}
          </label>

          <button
            onClick={handleUpload}
            disabled={!file || isCompressing}
            className="px-6 p-4 bg-foreground text-background rounded-r-lg shadow-md hover:bg-[#2A2B32] disabled:cursor-not-allowed transition-colors duration-300"
          >
            {isCompressing ? "Compressing..." : "Upload"}
          </button>
        </div>
      ) : (
        <p className="text-background p-4 rounded-lg bg-foreground justify-center">
          You have already uploaded a photo this month
        </p>
      )}
    </div>
  ) : null;
}
