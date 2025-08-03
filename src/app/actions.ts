
'use server';

import * as DataService from '@/lib/data-service';
import { revalidatePath } from 'next/cache';
import type { ModerateReviewInput, ModerateReviewOutput } from '@/ai/flows/moderate-review-flow';
import { moderateReview as moderateReviewFlow } from '@/ai/flows/moderate-review-flow';


/**
 * Server action to handle form submission for adding a teacher or review.
 * It calls the data service to interact with the database.
 * Returns an object indicating success or failure.
 */
export async function handleAddTeacherOrReview(data: {
    teacherName: string;
    subjectNames: string[]; 
    reviewText?: string; // Allow undefined
    reviewRating: number;
}): Promise<{ success: boolean; message: string; }> {
    const reviewText = data.reviewText || '';
    
    try {
        // Pass the data, ensuring reviewText is a string
        await DataService.addTeacherOrReview({
            ...data,
            reviewText: reviewText,
        });
        revalidatePath('/'); // Revalida a página principal e a de matérias
        revalidatePath('/subjects');
        revalidatePath('/teachers/[teacherId]', 'page');
        return { success: true, message: 'Avaliação enviada com sucesso!' };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Falha ao salvar os dados no banco de dados.";
        return { success: false, message: errorMessage };
    }
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
    revalidatePath('/'); // Revalidate home page to update recent reviews
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

/**
 * Server action to call the AI moderation flow.
 * This wraps the imported flow function in an async function to comply with "use server" requirements.
 */
export async function moderateReview(input: ModerateReviewInput): Promise<ModerateReviewOutput> {
    return moderateReviewFlow(input);
}
