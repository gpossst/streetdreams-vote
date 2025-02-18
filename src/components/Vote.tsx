import { getMonthPhotos, getVotes, submitVotes } from "@/utils/firebase";
import React, { useEffect, useState } from "react";
import VoteTile from "./Vote/VoteTile";
import { User } from "firebase/auth";
function Vote({ voteEnabled, user }: { voteEnabled: boolean; user: User }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [photos, setPhotos] = useState<any[]>([]);
  const [votes, setVotes] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const fetchVotes = async () => {
    const votes = await getVotes(user.uid);
    setVotes(votes);
  };

  useEffect(() => {
    getMonthPhotos().then((photos) => {
      setPhotos(photos);
    });
    fetchVotes();
  }, []);

  const handleSubmitVotes = async () => {
    setIsSubmitting(true);
    await submitVotes(user.uid, votes);
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-4 justify-center">
        {photos.map((photo, index) => (
          <div key={index}>
            <VoteTile
              voteEnabled={voteEnabled}
              photo={photo}
              votes={votes}
              setVotes={setVotes}
            />
          </div>
        ))}
      </div>
      {Object.keys(votes).length > 0 && voteEnabled && (
        <button onClick={handleSubmitVotes} disabled={isSubmitting}>
          {isSubmitting
            ? "Submitting..."
            : isSubmitted
            ? "Submit Again"
            : "Submit Votes"}
        </button>
      )}
    </div>
  );
}

export default Vote;
