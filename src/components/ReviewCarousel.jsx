import React, { useEffect, useState } from "react";

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
    <div className="flex flex-col items-start gap-4 text-white animate-fade-in max-w-2xl">
      <span className="font-sans text-6xl font-bold mt-5 capitalize">
        {review.comment}
      </span>
      <div className="flex flex-col">
        <span className="font-medium text-xl font-sans text-white/80">
          {review.name}
        </span>
      </div>
    </div>
  );
};

export default ReviewCarousel;
