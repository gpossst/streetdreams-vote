import React, { useEffect, useState } from "react";
import { getTopVotedPhotos, getUserNameById } from "@/utils/firebase";

type PhotoData = {
  fileKey: string;
  fileUrl: string;
  fileName: string;
  uploadedBy: string;
};

export default function Results({ voteEnabled }: { voteEnabled: number }) {
  const [topVotedPhotos, setTopVotedPhotos] = useState<
    {
      photo: PhotoData;
      votes: number;
      userName: string;
    }[]
  >([]);

  // Find the winner (photo with maximum votes)
  const winner =
    topVotedPhotos.length > 0
      ? topVotedPhotos.reduce((max, current) =>
          current.votes > max.votes ? current : max
        )
      : null;

  useEffect(() => {
    const fetchTopVotedPhotos = async () => {
      const out = await getUserNameById("9Ja98qsDLLasadsgKtLdTP70Zyv2");
      console.log(out || "nothing");
      const photos = await getTopVotedPhotos();
      const photosWithUserNames = await Promise.all(
        photos.map(async (item) => {
          const userName = await getUserNameById(item.photo.uploadedBy);
          console.log(userName || "nothing");
          return { ...item, userName };
        })
      );
      setTopVotedPhotos(
        photosWithUserNames as {
          photo: PhotoData;
          votes: number;
          userName: string;
        }[]
      );
    };

    fetchTopVotedPhotos();
  }, []);

  if (voteEnabled !== 2) {
    return null;
  }

  return (
    <div className="flex flex-col items-center md: pt-16 sm:pt-3 px-10 py-4">
      <h1 className="text-2xl font-bold pb-4">Results</h1>
      <div className="flex sm:flex-row flex-col gap-4">
        {[...topVotedPhotos].map(({ photo, votes, userName }, index, array) => {
          // Determine display order based on screen size
          const isSmallScreen = window.innerWidth < 640;
          const displayIndex = isSmallScreen
            ? index
            : index === 0
            ? 1
            : index === 1
            ? 0
            : index;
          const item = array[displayIndex];

          const isWinner = item.photo.fileKey === winner?.photo.fileKey;

          return (
            <div
              key={item.photo.fileKey}
              className={`flex flex-col items-center ${
                displayIndex === 0 ? "flex-[3]" : "flex-[2]"
              }`}
            >
              <img src={item.photo.fileUrl} alt={item.photo.fileName} />
              {isWinner ? (
                <p className="text-xl font-bold text-green-600 mt-2">
                  🏆 Winner! {item.userName}
                </p>
              ) : (
                <p>{item.userName}</p>
              )}
              <p>{votes > 1 ? `${votes} votes` : "1 vote"}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
