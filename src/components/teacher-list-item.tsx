
'use client';

import Link from 'next/link';
import type { Teacher } from '@/lib/types';
import StarRating from './star-rating';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from './ui/avatar';

interface TeacherListItemProps {
  teacher: Teacher;
}

const getInitials = (name: string) => {
    const nameParts = name.split(' ');
    if (nameParts.length > 1) {
        return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

export default function TeacherListItem({ teacher }: TeacherListItemProps) {
  const { id, name, averageRating = 0, reviews } = teacher;
  const totalReviewCount = reviews.length;

  return (
    <Link 
        href={`/teachers/${id}`}
        className={cn(
            "group flex items-center gap-4 rounded-lg p-4 transition-colors",
            "border-2 border-transparent hover:border-primary hover:bg-primary/5 bg-card/50"
        )}
    >
        <Avatar className="h-12 w-12 text-lg">
            <AvatarFallback className="bg-secondary text-secondary-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                {getInitials(name)}
            </AvatarFallback>
        </Avatar>

        <div className="flex-1">
            <p className="font-semibold text-base group-hover:text-primary transition-colors">{name}</p>
            <p className="text-sm text-muted-foreground">{totalReviewCount} {totalReviewCount === 1 ? 'avaliação' : 'avaliações'}</p>
        </div>

        <div className="flex items-center gap-2">
            <StarRating rating={averageRating} />
            <span className="font-bold text-base text-muted-foreground">{averageRating.toFixed(1)}</span>
        </div>
    </Link>
  );
}
