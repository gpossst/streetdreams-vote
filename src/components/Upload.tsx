"use client";
import React, { useEffect, useState } from "react";
import imageCompression from "browser-image-compression";
import { uploadFiles } from "@/utils/uploadthing";
import { auth } from "@/utils/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

export default function Upload() {
  const [user, setUser] = useState<User | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
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
    } catch (error) {
      console.error("Error processing image:", error);
      alert("Error processing image");
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*" // Changed to accept any image format
        onChange={handleFileChange}
      />
      <button onClick={handleUpload} disabled={!file || isCompressing}>
        {isCompressing ? "Compressing..." : "Upload"}
      </button>
    </div>
  );
}
