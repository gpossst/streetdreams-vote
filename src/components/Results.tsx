import React, { useEffect, useState } from "react";
import { getTopVotedPhotos } from "@/utils/firebase";

export default function Results() {
  const [topVotedPhotos, setTopVotedPhotos] = useState<
    {
      photoId: string;
      votes: number;
    }[]
  >([]);

  useEffect(() => {
    getTopVotedPhotos().then((photos) => {
      const formattedPhotos = photos.map(([photoId, votes]) => ({
        photoId,
        votes: Number(votes),
      }));
      setTopVotedPhotos(formattedPhotos);
    });
  }, []);
  return (
    <div>
      {topVotedPhotos.map((photo) => (
        <div key={photo.photoId}>
          <h3>{photo.photoId}</h3>
          <p>{photo.votes} votes</p>
        </div>
      ))}
    </div>
  );
}
