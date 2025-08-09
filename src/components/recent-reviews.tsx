
'use client';

import type { Review } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Quote, User, Book } from 'lucide-react';
import StarRating from './star-rating';
import Link from 'next/link';
import { Badge } from './ui/badge';


interface RecentReviewsProps {
  initialReviews: Review[];
}

export default function RecentReviews({ initialReviews }: RecentReviewsProps) {
  
  const formatDate = (dateString: string | undefined) => {
    if(!dateString) return '';
    try {
        const date = new Date(dateString);
        // Using a consistent format that works on both server and client
        return date.toLocaleDateString('pt-BR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (e) {
        return "Data inválida";
    }
  };

  if (initialReviews.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {initialReviews.map(review => (
            <div key={review.id} className="p-1 h-full">
                <Card className="bg-card/50 shadow-sm flex flex-col h-full">
                    <CardHeader className="pb-3">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <StarRating rating={review.rating} />
                            <span className="text-xs text-muted-foreground">
                                {formatDate(review.createdAt)}
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        {review.text && (
                            <blockquote className="relative p-4 text-sm border-l-4 border-primary/50 bg-background rounded-r-lg h-24 overflow-y-auto">
                                <Quote className="absolute -top-2 -left-3 h-5 w-5 text-primary/50" />
                                {review.text}
                            </blockquote>
                        )}
                    </CardContent>
                    <CardFooter className="flex-col items-start gap-4 pt-3">
                        <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div className='flex items-center gap-4 flex-wrap'>
                                <Link href={`/teachers/${review.teacherId}`} className="flex items-center gap-1.5 group" title={`Professor(a) ${review.teacherName}`}>
                                    <User className="h-4 w-4" />
                                    <span className="font-medium truncate group-hover:underline group-hover:text-primary">{review.teacherName}</span>
                                </Link>
                                <div className="flex items-center gap-1.5 flex-wrap" title={`Matérias`}>
                                <Book className="h-4 w-4" />
                                {review.subjectNames?.map((subjectName, index) => (
                                    <Link href={`/subjects/${review.subjectIds?.[index]}`} key={`${review.id}-${review.subjectIds?.[index]}`}>
                                    <Badge variant="secondary" className="hover:bg-primary/20 transition-colors">{subjectName}</Badge>
                                    </Link>
                                ))}
                                </div>
                            </div>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        ))}
    </div>
  );
}
