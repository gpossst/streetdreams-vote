import { getMonthPhotos, getVotes, submitVotes } from "@/utils/firebase";
import React, { useEffect, useState } from "react";
import VoteTile from "./Vote/VoteTile";
import { User } from "firebase/auth";
function Vote({ voteEnabled, user }: { voteEnabled: number; user: User }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [photos, setPhotos] = useState<any[]>([]);
  const [votes, setVotes] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const fetchVotes = async () => {
    const votes = await getVotes(user.uid);
    setVotes(votes || {});
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

  if (voteEnabled === 2) {
    return null;
  }

  return (
    <div className={`w-full ${voteEnabled === 1 ? "pt-12" : ""}`}>
      <div className="flex flex-wrap gap-4 justify-center">
        {photos.map((photo, index) => (
          <div key={index}>
            <VoteTile
              voteEnabled={voteEnabled === 1}
              photo={photo}
              votes={votes}
              setVotes={setVotes}
            />
          </div>
        ))}
      </div>
      {Object.keys(votes).length > 0 && voteEnabled === 1 && (
        <button
          className="absolute shadow-lg hover:bg-[#CC444B] hover:text-foreground transition-all duration-300 bottom-8 left-1/2 transform -translate-x-1/2 bg-foreground text-background rounded-lg p-2 items-center justify-center"
          onClick={handleSubmitVotes}
          disabled={isSubmitting}
        >
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
