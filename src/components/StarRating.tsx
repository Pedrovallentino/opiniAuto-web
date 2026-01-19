import { Star, StarHalf } from 'lucide-react';
import { cn } from '../lib/utils';

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function StarRating({ rating, size = 'md', className }: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = Math.max(0, 5 - fullStars - (hasHalfStar ? 1 : 0));

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
  };

  return (
    <div className={cn("flex items-center", className)}>
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className={cn(sizeClasses[size], "fill-yellow-400 text-yellow-400")} />
      ))}
      {hasHalfStar && <StarHalf className={cn(sizeClasses[size], "fill-yellow-400 text-yellow-400")} />}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className={cn(sizeClasses[size], "text-gray-300")} />
      ))}
    </div>
  );
}
