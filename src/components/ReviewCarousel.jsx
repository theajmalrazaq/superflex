import React, { useEffect, useState } from "react";

// Static import of reviews.json
import reviews from "../../public/reviews.json";

const ReviewCarousel = () => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const review = reviews[index];
  if (!review) return null;
  return (
    <div className="flex items-center gap-3 text-white/80 bg-black/30 rounded-xl  mb-3 animate-fade-in">
      <img
        src={review.photo_url}
        alt={review.name}
        className="h-8 w-8 rounded-full object-cover border border-x"
        loading="lazy"
      />
      <div className="flex flex-col">
        <span className="font-semibold text-sm text-x">{review.name}</span>
        <span className="italic text-xs text-white/60">{review.comment}</span>
      </div>
    </div>
  );
};

export default ReviewCarousel;