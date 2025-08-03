import { Star, StarHalf, StarOff } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  className?: string;
}

export default function StarRating({ rating, maxRating = 5, className }: StarRatingProps) {
  const safeRating = Math.max(0, rating || 0);
  const fullStars = Math.floor(safeRating);
  const hasHalfStar = safeRating % 1 !== 0;
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={`flex items-center text-primary ${className}`} aria-label={`Rating: ${safeRating} out of ${maxRating} stars`}>
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className="h-5 w-5 fill-current" />
      ))}
      {hasHalfStar && <StarHalf key="half" className="h-5 w-5 fill-current" />}
      {[...Array(Math.max(0, emptyStars))].map((_, i) => (
        <Star key={`empty-${i}`} className="h-5 w-5 text-muted/50 fill-muted/20" />
      ))}
    </div>
  );
}
