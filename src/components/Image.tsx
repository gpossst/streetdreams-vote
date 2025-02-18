import React, { useState } from "react";
import NextImage from "next/image";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Image({ photo }: { photo: any }) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="h-full w-full">
      <div onClick={() => setShowPreview(true)} style={{ cursor: "pointer" }}>
        <NextImage
          src={photo.fileUrl}
          alt={photo.fileName}
          width={400}
          height={400}
          className="w-full aspect-square object-cover"
        />
      </div>

      {showPreview && (
        <div
          onClick={() => setShowPreview(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <NextImage
            src={photo.fileUrl}
            alt={photo.fileName}
            width={800}
            height={800}
            style={{ objectFit: "contain" }}
          />
        </div>
      )}
    </div>
  );
}
