
"use client";

import { useState, useEffect } from 'react';
import type { Teacher } from '@/lib/types';
import WelcomeReviewDialog from './welcome-review-dialog';

interface WelcomeReviewHandlerProps {
    teachers: Teacher[];
    onSubmit: (data: any) => Promise<{ success: boolean; message: string; }>;
}

export default function WelcomeReviewHandler({ teachers, onSubmit }: WelcomeReviewHandlerProps) {
    const [teacherToPrompt, setTeacherToPrompt] = useState<Teacher | null>(null);

    useEffect(() => {
        // This logic now runs only on the client-side to prevent hydration errors.
        let selectedTeacher: Teacher | null = null;
        
        // Filter teachers with no reviews
        const teachersWithNoReviews = teachers.filter(t => t.reviews.length === 0);
        
        if (teachersWithNoReviews.length > 0) {
            // If there are teachers with no reviews, pick one at random
            selectedTeacher = teachersWithNoReviews[Math.floor(Math.random() * teachersWithNoReviews.length)];
        } else {
            // Otherwise, find one with less than 2 reviews to prompt for more feedback
            const teachersWithFewReviews = teachers.filter(t => t.reviews.length > 0 && t.reviews.length < 2);
            if (teachersWithFewReviews.length > 0) {
                // Pick a random teacher from this smaller pool
                selectedTeacher = teachersWithFewReviews[Math.floor(Math.random() * teachersWithFewReviews.length)];
            }
        }

        // Only set the teacher if one was selected
        if (selectedTeacher) {
            setTeacherToPrompt(selectedTeacher);
        }
    }, [teachers]);

    if (!teacherToPrompt) {
        return null;
    }

    return (
        <WelcomeReviewDialog 
            teacherToPrompt={teacherToPrompt}
            onSubmit={onSubmit}
        />
    );
}
