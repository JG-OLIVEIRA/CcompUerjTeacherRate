
'use client';

import type { Review } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Quote, User, Book, MessageSquare } from 'lucide-react';
import StarRating from './star-rating';
import Link from 'next/link';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface RecentReviewsProps {
  initialReviews: Review[];
}

const getInitials = (name: string) => {
    if (!name) return '??';
    const nameParts = name.split(' ');
    if (nameParts.length > 1) {
        return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}


export default function RecentReviews({ initialReviews }: RecentReviewsProps) {
  
  const formatDate = (dateString: string | undefined) => {
    if(!dateString) return '';
    try {
        const date = new Date(dateString);
        // Using a consistent format that works on both server and client
        return date.toLocaleDateString('pt-BR', {
            month: 'short',
            day: 'numeric'
        });
    } catch (e) {
        return "Data inválida";
    }
  };

  if (initialReviews.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialReviews.map(review => {
            const avatarUrl = `https://robohash.org/${encodeURIComponent(review.teacherName || '')}?set=set4&bgset=bg1`;
            return (
                <div key={review.id} className="flex flex-col">
                    <Card className="bg-card/50 shadow-sm flex flex-col h-full overflow-hidden">
                        <CardHeader className="p-4 bg-secondary/50">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 border-2 border-primary/50">
                                        <AvatarImage src={avatarUrl} alt={`Avatar de ${review.teacherName}`} />
                                        <AvatarFallback>{getInitials(review.teacherName || '')}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <Link href={`/teachers/${review.teacherId}`} className="font-semibold text-foreground hover:underline">
                                            {review.teacherName}
                                        </Link>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {review.subjectNames?.map((subjectName, index) => (
                                                <Link href={`/subjects/${review.subjectIds?.[index]}`} key={`${review.id}-${review.subjectIds?.[index]}`}>
                                                    <Badge variant="outline" className="text-xs">{subjectName}</Badge>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <StarRating rating={review.rating} />
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 flex-grow">
                             {review.text && (
                                <blockquote className="relative text-sm text-foreground/90 flex-grow">
                                    <Quote className="absolute -top-2 -left-2 h-6 w-6 text-primary/20" />
                                    <p className="pl-2 italic line-clamp-4">{review.text}</p>
                                </blockquote>
                            )}
                        </CardContent>
                        <CardFooter className="p-4 pt-0 mt-auto">
                            <span className="text-xs text-muted-foreground w-full text-right">
                                {formatDate(review.createdAt)}
                            </span>
                        </CardFooter>
                    </Card>
                </div>
            )
        })}
    </div>
  );
}
