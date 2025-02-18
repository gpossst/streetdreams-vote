import React from "react";
import CustomImage from "../Image";

export default function VoteTile({
  voteEnabled,
  photo,
  votes,
  setVotes,
}: {
  voteEnabled: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  photo: any;
  votes: { [key: string]: number };
  setVotes: (votes: { [key: string]: number }) => void;
}) {
  const handleVote = () => {
    const currentVotes = votes[photo.fileKey] || 0;
    const totalVotes = Object.values(votes).reduce(
      (sum, count) => sum + count,
      0
    );
    if (totalVotes >= 10) return;

    setVotes({
      ...votes,
      [photo.fileKey]: currentVotes + 1,
    });
  };

  const handleDownVote = () => {
    const currentVotes = votes[photo.fileKey] || 0;
    if (currentVotes <= 0) return;

    setVotes({
      ...votes,
      [photo.fileKey]: currentVotes - 1,
    });
  };

  return (
    <div>
      <CustomImage photo={photo} />
      {voteEnabled ? (
        <div className="flex flex-row justify-between">
          <button onClick={handleDownVote}>Down Vote</button>
          <p>{votes[photo.fileKey] ? votes[photo.fileKey] : 0}</p>
          <button onClick={handleVote}>Up Vote</button>
        </div>
      ) : null}
    </div>
  );
}
