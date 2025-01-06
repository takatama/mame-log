import React from 'react';

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, onRatingChange }) => {
  return (
    <div className="flex justify-between w-full">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRatingChange(star)}
          className={`text-2xl ${rating >= star ? 'text-yellow-500' : 'text-gray-400'}`}
        >
          ★
        </button>
      ))}
    </div>
  );
};

export default StarRating;
