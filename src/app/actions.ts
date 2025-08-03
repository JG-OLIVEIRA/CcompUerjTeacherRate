
'use server';

import * as DataService from '@/lib/data-service';
import { revalidatePath } from 'next/cache';

// Local moderation based on a word blocklist
function localModerateReview(text: string): { isAppropriate: boolean; reason?: string } {
    if (!text || !text.trim()) {
        return { isAppropriate: true };
    }

    const blocklist = [
        'merda', 'bosta', 'caralho', 'cu', 'puta', 'viado', 'arrombado', 'foder',
        'porra', 'vsf', 'tnc', 'fdp', 'lixo', 'otário', 'babaca', 'idiota', 
        'imbecil', 'retardado', 'mongol', 'gordo', 'gorda', 'feio', 'feia',
        'horrível', 'nojento', 'insuportável', 'chato', 'chata', 'burro', 'burra'
        // Add more words as needed
    ];

    const lowerCaseText = text.toLowerCase();

    for (const word of blocklist) {
        // Use word boundaries to avoid matching parts of words (e.g., 'cu' in 'escuta')
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        if (regex.test(lowerCaseText)) {
            return {
                isAppropriate: false,
                reason: `Sua avaliação contém linguagem inadequada ("${word}"). Por favor, reformule seu feedback para ser mais construtivo.`
            };
        }
    }

    return { isAppropriate: true };
}


/**
 * Server action to handle form submission for adding a teacher or review.
 * It calls the data service to interact with the database.
 */
export async function handleAddTeacherOrReview(data: {
    teacherName: string;
    subjectNames: string[]; 
    reviewText?: string; // Allow undefined
    reviewRating: number;
}) {
    const reviewText = data.reviewText || '';

    // Local moderation check
    const moderationResult = localModerateReview(reviewText);
    if (!moderationResult.isAppropriate) {
        // If the content is inappropriate, throw an error with the reason.
        throw new Error(moderationResult.reason || "Sua avaliação foi considerada inadequada e não pôde ser enviada.");
    }
    
    // Pass the data, ensuring reviewText is a string
    await DataService.addTeacherOrReview({
        ...data,
        reviewText: reviewText,
    });
    revalidatePath('/'); // Revalida a página principal e a de matérias
    revalidatePath('/subjects');
    revalidatePath('/teachers/[teacherId]', 'page');
}


/**
 * Server action to upvote a review.
 */
export async function upvoteReview(reviewId: number) {
    await DataService.upvoteReview(reviewId);
    revalidatePath('/');
    revalidatePath('/subjects');
    revalidatePath('/teachers/[teacherId]', 'page');
}

/**
 * Server action to downvote a review.
 */
export async function downvoteReview(reviewId: number) {
    await DataService.downvoteReview(reviewId);
    revalidatePath('/');
    revalidatePath('/subjects');
    revalidatePath('/teachers/[teacherId]', 'page');
}

/**
 * Server action to report a review.
 */
export async function reportReview(reviewId: number) {
    await DataService.reportReview(reviewId);
    revalidatePath('/');
    revalidatePath('/subjects');
    revalidatePath('/teachers/[teacherId]', 'page');
}


/**
 * Server action to fetch all teachers.
 */
export async function getAllTeachers() {
    return DataService.getAllTeachers();
}

/**
 * Server action to approve a reported review, potentially deleting it.
 */
export async function approveReportedReview(reviewId: number) {
    await DataService.approveReport(reviewId);
    revalidatePath('/moderation');
}

/**
 * Server action to handle a professor's request submission.
 * It now saves the request to the database.
 */
export async function handleRequest(data: { professorName: string; email: string; message: string }) {
    try {
        await DataService.addProfessorRequest(data);
        return { success: true, message: 'Sua solicitação foi enviada com sucesso e será analisada!' };
    } catch (error) {
        console.error("Error handling request:", error);
        const errorMessage = error instanceof Error ? error.message : "Não foi possível enviar sua solicitação. Tente novamente mais tarde.";
        return { success: false, message: errorMessage };
    }
}
