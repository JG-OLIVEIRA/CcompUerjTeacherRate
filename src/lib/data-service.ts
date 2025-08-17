

/**
 * @file data-service.ts
 * 
 * Este arquivo atua como uma camada de serviço de dados, conectando-se
 * a um banco de dados PostgreSQL para persistir os dados da aplicação.
 */
import 'server-only';
import type { Subject, Teacher, Review, SubjectLink } from './types';
import { pool } from './db';


function assignIconName(subjectName: string): string {
    const name = subjectName.toLowerCase();
    if (name.includes('cálculo') || name.includes('matemática') || name.includes('geometria') || name.includes('álgebra')) return 'Sigma';
    if (name.includes('física')) return 'Atom';
    if (name.includes('computação') || name.includes('algoritmos') || name.includes('programação') || name.includes('sistemas') || name.includes('software') || name.includes('arquitetura') || name.includes('redes') || name.includes('dados') || name.includes('inteligência artificial')) return 'Laptop';
    if (name.includes('lógica')) return 'BrainCircuit';
    if (name.includes('grafos')) return 'GitGraph';
    return 'GraduationCap';
}

const calculateAverageRating = (reviews: Review[]): number => {
    if (!reviews || reviews.length === 0) return 0;
    const validReviews = reviews.filter(review => typeof review.rating === 'number' && !isNaN(review.rating));
    if (validReviews.length === 0) return 0;
    const total = validReviews.reduce((acc, review) => acc + (review.rating || 0), 0);
    return total / validReviews.length;
};


export async function getSubjects(): Promise<Subject[]> {
    const client = await pool.connect();
    try {
        const subjectsResult = await client.query('SELECT id, name FROM subjects ORDER BY name;');
        const subjectsMap: Map<number, Subject> = new Map(
            subjectsResult.rows.map(row => [
                row.id,
                {
                    id: row.id,
                    name: row.name,
                    iconName: assignIconName(row.name),
                    teachers: [],
                },
            ])
        );

        const dataQuery = `
            SELECT 
                r.subject_id,
                s.name as subject_name,
                t.id as teacher_id,
                t.name as teacher_name,
                r.id as review_id,
                r.text as review_text,
                r.rating as review_rating,
                r.upvotes as review_upvotes,
                r.downvotes as review_downvotes,
                r.created_at as review_created_at,
                r.report_count
            FROM reviews r
            JOIN teachers t ON r.teacher_id = t.id
            JOIN subjects s ON r.subject_id = s.id
            WHERE r.reported = false;
        `;
        
        const dataResult = await client.query(dataQuery);

        const teachersMap: Map<string, Teacher> = new Map(); // Key: "teacherId-subjectId"

        for (const row of dataResult.rows) {
            const subject = subjectsMap.get(row.subject_id);
            if (!subject) continue;

            const teacherKey = `${row.teacher_id}-${row.subject_id}`;
            let teacher = teachersMap.get(teacherKey);

            if (!teacher) {
                teacher = {
                    id: row.teacher_id,
                    name: row.teacher_name,
                    subject: subject.name,
                    reviews: [],
                    averageRating: 0,
                };
                teachersMap.set(teacherKey, teacher);
                subject.teachers.push(teacher);
            }
            
            if (row.review_id && !teacher.reviews.some(rev => rev.id === row.review_id)) {
                 teacher.reviews.push({
                    id: row.review_id,
                    text: row.review_text || '',
                    rating: row.review_rating || 0,
                    upvotes: row.review_upvotes || 0,
                    downvotes: row.review_downvotes || 0,
                    createdAt: row.review_created_at?.toISOString() || '',
                    report_count: row.report_count || 0,
                });
            }
        }
        
        subjectsMap.forEach(subject => {
            subject.teachers.forEach(teacher => {
                teacher.averageRating = calculateAverageRating(teacher.reviews);
            });
            subject.teachers.sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0));
        });

        return Array.from(subjectsMap.values());

    } catch (error) {
        console.error("Erro ao buscar dados do PostgreSQL:", error);
        throw error;
    } finally {
        client.release();
    }
}


export async function addTeacherOrReview(data: {
  teacherName: string;
  subjectNames: string[];
  reviewText: string;
  reviewRating: number;
}): Promise<void> {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Find or create the teacher
        let teacherResult = await client.query('SELECT id FROM teachers WHERE name = $1', [data.teacherName]);
        let teacherId;
        if (teacherResult.rowCount === 0) {
            const newTeacherResult = await client.query('INSERT INTO teachers (name) VALUES ($1) RETURNING id', [data.teacherName]);
            teacherId = newTeacherResult.rows[0].id;
        } else {
            teacherId = teacherResult.rows[0].id;
        }

        // For each subject, create the review
        for (const subjectName of data.subjectNames) {
            let subjectId;
            const subjectResult = await client.query('SELECT id FROM subjects WHERE name = $1', [subjectName]);
            if (subjectResult.rowCount === 0) {
                // If subject doesn't exist, create it.
                const newSubjectResult = await client.query('INSERT INTO subjects (name) VALUES ($1) RETURNING id', [subjectName]);
                subjectId = newSubjectResult.rows[0].id;
            } else {
                subjectId = subjectResult.rows[0].id;
            }
            
            // The duplication check is now handled on the client-side to be user-specific.
            // The server will simply insert the review.
            await client.query(
                'INSERT INTO reviews (text, rating, teacher_id, subject_id, created_at) VALUES ($1, $2, $3, $4, NOW())',
                [data.reviewText || '', data.reviewRating, teacherId, subjectId]
            );
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Erro ao adicionar professor/avaliação:", error);
        throw new Error("Falha ao salvar os dados no banco de dados.");
    } finally {
        client.release();
    }
}

export async function upvoteReview(reviewId: number): Promise<void> {
    const client = await pool.connect();
    try {
        await client.query('UPDATE reviews SET upvotes = upvotes + 1 WHERE id = $1', [reviewId]);
    } catch (error) {
        console.error("Erro ao dar upvote na avaliação:", error);
        throw new Error("Falha ao registrar o voto.");
    } finally {
        client.release();
    }
}

export async function downvoteReview(reviewId: number): Promise<void> {
    const client = await pool.connect();
    try {
        await client.query('UPDATE reviews SET downvotes = downvotes + 1 WHERE id = $1', [reviewId]);
    } catch (error) {
        console.error("Erro ao dar downvote na avaliação:", error);
        throw new Error("Falha ao registrar o voto.");
    } finally {
        client.release();
    }
}


export async function reportReview(reviewId: number): Promise<void> {
    const client = await pool.connect();
    try {
        // Increment report_count
        const result = await client.query(
            'UPDATE reviews SET report_count = report_count + 1 WHERE id = $1 RETURNING report_count',
            [reviewId]
        );
        
        // If report_count reaches 2, set reported to true to hide it
        if (result.rows[0].report_count >= 2) {
             await client.query(
                'UPDATE reviews SET reported = true WHERE id = $1',
                [reviewId]
            );
        }

    } catch (error) {
        console.error("Erro ao denunciar avaliação:", error);
        throw new Error("Falha ao registrar a denúncia.");
    } finally {
        client.release();
    }
}


export async function getAllTeachers(): Promise<{ id: number; name: string }[]> {
    const client = await pool.connect();
    try {
        const result = await client.query("SELECT id, name FROM teachers ORDER BY name");
        return result.rows;
    } catch (error) {
        console.error("Erro ao buscar todos os professores:", error);
        return [];
    } finally {
        client.release();
    }
}

export async function getAllSubjectNames(): Promise<string[]> {
    const client = await pool.connect();
    try {
        const result = await client.query("SELECT name FROM subjects ORDER BY name");
        return result.rows.map(row => row.name);
    } catch (error) {
        console.error("Error fetching all subject names:", error);
        return [];
    } finally {
        client.release();
    }
}

export async function getTeachersWithGlobalStats(): Promise<Teacher[]> {
    const client = await pool.connect();
    try {
        const query = `
            SELECT 
                t.id as teacher_id,
                t.name as teacher_name,
                r.id as review_id,
                r.text,
                r.rating,
                r.upvotes,
                r.downvotes,
                r.created_at,
                r.report_count,
                s.name as subject_name,
                s.id as subject_id
            FROM teachers t
            LEFT JOIN reviews r ON t.id = r.teacher_id AND r.reported = false
            LEFT JOIN subjects s ON r.subject_id = s.id
            ORDER BY t.name, r.created_at DESC;
        `;
        const result = await client.query(query);

        const teachersMap: Map<number, Teacher> = new Map();

        result.rows.forEach(row => {
            let teacher = teachersMap.get(row.teacher_id);

            if (!teacher) {
                teacher = {
                    id: row.teacher_id,
                    name: row.teacher_name,
                    reviews: [],
                    averageRating: 0,
                    subjects: new Set<string>(),
                };
                teachersMap.set(row.teacher_id, teacher);
            }

            if (row.review_id) {
                // To handle grouping reviews submitted at the same time for the same teacher
                const fiveSeconds = 5 * 1000;
                const submissionTime = new Date(row.created_at).getTime();
                const existingReview = teacher.reviews.find(r => 
                    r.text === row.text && 
                    r.rating === row.rating &&
                    r.createdAt &&
                    Math.abs(new Date(r.createdAt).getTime() - submissionTime) < fiveSeconds
                );

                if (existingReview) {
                    if (row.subject_id && !existingReview.subjectIds?.includes(row.subject_id)) {
                        existingReview.subjectIds?.push(row.subject_id);
                        existingReview.subjectNames?.push(row.subject_name);
                    }
                } else {
                    teacher.reviews.push({
                        id: row.review_id,
                        text: row.text,
                        rating: row.rating,
                        upvotes: row.upvotes,
                        downvotes: row.downvotes,
                        createdAt: row.created_at?.toISOString() || '',
                        report_count: row.report_count,
                        teacherId: row.teacher_id,
                        teacherName: row.teacher_name,
                        subjectId: row.subject_id,
                        subjectName: row.subject_name,
                        subjectIds: [row.subject_id],
                        subjectNames: [row.subject_name],
                    });
                }
            }

             if (row.subject_name) {
                (teacher.subjects as Set<string>).add(row.subject_name);
            }
        });

        const teacherList = Array.from(teachersMap.values());
        for (const teacher of teacherList) {
            teacher.averageRating = calculateAverageRating(teacher.reviews);
        }

        return teacherList.sort((a,b) => a.name.localeCompare(b.name));

    } catch (error) {
        console.error("Erro ao buscar professores com estatísticas globais:", error);
        return [];
    } finally {
        client.release();
    }
}


export async function getRecentReviews(): Promise<Review[]> {
    const client = await pool.connect();
    try {
        const query = `
            SELECT
                r.id,
                r.text,
                r.rating,
                r.upvotes,
                r.downvotes,
                r.created_at,
                r.report_count,
                t.id as teacher_id,
                t.name as teacher_name,
                s.id as subject_id,
                s.name as subject_name
            FROM reviews r
            JOIN teachers t ON r.teacher_id = t.id
            JOIN subjects s ON r.subject_id = s.id
            WHERE r.reported = false AND r.text IS NOT NULL AND r.text <> ''
            ORDER BY r.created_at DESC
            LIMIT 15;
        `;
        const result = await client.query(query);

        // Group reviews to combine ones submitted at the same time
        const reviewGroups: Map<string, Review> = new Map();
        for (const row of result.rows) {
             const submissionTime = new Date(row.created_at).getTime();
             const groupKey = `${row.teacher_id}-${row.rating}-${row.text}-${Math.round(submissionTime / 5000)}`; // Group by 5-second intervals

            let group = reviewGroups.get(groupKey);

            if (group) {
                if (row.subject_id && !group.subjectIds?.includes(row.subject_id)) {
                    group.subjectIds?.push(row.subject_id);
                    group.subjectNames?.push(row.subject_name);
                }
            } else {
                 reviewGroups.set(groupKey, {
                    id: row.id,
                    text: row.text,
                    rating: row.rating,
                    upvotes: row.upvotes,
                    downvotes: row.downvotes,
                    createdAt: row.created_at?.toISOString() || '',
                    report_count: row.report_count,
                    teacherId: row.teacher_id,
                    teacherName: row.teacher_name,
                    subjectId: row.subject_id,
                    subjectName: row.subject_name,
                    subjectIds: [row.subject_id],
                    subjectNames: [row.subject_name]
                });
            }
        }
        
        return Array.from(reviewGroups.values()).slice(0, 3);

    } catch (error) {
        console.error("Erro ao buscar avaliações recentes:", error);
        return [];
    } finally {
        client.release();
    }
}


export async function getReportedReviews(): Promise<Review[]> {
    const client = await pool.connect();
    try {
        const query = `
            SELECT
                r.id,
                r.text,
                r.rating,
                r.upvotes,
                r.downvotes,
                r.report_count,
                r.created_at,
                t.name as teacher_name,
                s.name as subject_name
            FROM reviews r
            JOIN teachers t ON r.teacher_id = t.id
            JOIN subjects s ON r.subject_id = s.id
            WHERE r.reported = true
            ORDER BY r.report_count DESC, r.created_at ASC;
        `;
        const result = await client.query(query);
        return result.rows.map(row => ({
            id: row.id,
            text: row.text || '',
            rating: row.rating || 0,
            upvotes: row.upvotes || 0,
            downvotes: row.downvotes || 0,
            report_count: row.report_count || 0,
            createdAt: row.created_at?.toISOString() || '',
            teacherName: row.teacher_name,
            subjectName: row.subject_name,
        }));
    } catch (error) {
        console.error("Erro ao buscar avaliações denunciadas:", error);
        return [];
    } finally {
        client.release();
    }
}

export async function approveReport(reviewId: number): Promise<void> {
    const client = await pool.connect();
    const DELETION_THRESHOLD = 5; 

    try {
        await client.query('BEGIN');
        
        const updateResult = await client.query(
            'UPDATE reviews SET report_count = report_count + 1 WHERE id = $1 RETURNING report_count',
            [reviewId]
        );
        
        if (updateResult.rows.length === 0) {
            throw new Error('Avaliação não encontrada.');
        }

        const newReportCount = updateResult.rows[0].report_count;

        if (newReportCount >= DELETION_THRESHOLD) {
            await client.query('DELETE FROM reviews WHERE id = $1', [reviewId]);
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Erro ao aprovar denúncia:", error);
        throw new Error('Falha ao aprovar denúncia.');
    } finally {
        client.release();
    }
}

export async function rejectReport(reviewId: number): Promise<void> {
    const client = await pool.connect();
    const VISIBILITY_THRESHOLD = 2;

    try {
        await client.query('BEGIN');

        const updateResult = await client.query(
            'UPDATE reviews SET report_count = report_count - 1 WHERE id = $1 RETURNING report_count',
            [reviewId]
        );

        if (updateResult.rows.length === 0) {
            throw new Error('Avaliação não encontrada.');
        }

        const newReportCount = updateResult.rows[0].report_count;

        // If the report count drops below the visibility threshold, make the review public again.
        if (newReportCount < VISIBILITY_THRESHOLD) {
            await client.query(
                'UPDATE reviews SET reported = false WHERE id = $1',
                [reviewId]
            );
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Erro ao rejeitar denúncia:", error);
        throw new Error('Falha ao rejeitar denúncia.');
    } finally {
        client.release();
    }
}


export async function getTeacherById(teacherId: number): Promise<Teacher | null> {
    const client = await pool.connect();
    try {
        const teacherResult = await client.query("SELECT id, name FROM teachers WHERE id = $1", [teacherId]);
        if (teacherResult.rowCount === 0) {
            return null;
        }

        const teacherData = teacherResult.rows[0];

        const reviewsQuery = `
            SELECT
                r.id,
                r.text,
                r.rating,
                r.upvotes,
                r.downvotes,
                r.created_at,
                r.report_count,
                s.name as subject_name,
                s.id as subject_id
            FROM reviews r
            LEFT JOIN subjects s ON r.subject_id = s.id
            WHERE r.teacher_id = $1 AND r.reported = false
            ORDER BY r.created_at DESC;
        `;
        const reviewsResult = await client.query(reviewsQuery, [teacherId]);
        
        const allSubjects = new Set<string>();
        const reviews: Review[] = [];

        reviewsResult.rows.forEach(row => {
            if (row.subject_name) {
                allSubjects.add(row.subject_name);
            }
             if (row.id) {
                // To handle grouping reviews submitted at the same time
                const fiveSeconds = 5 * 1000;
                const submissionTime = new Date(row.created_at).getTime();
                const existingReview = reviews.find(r => 
                    r.text === row.text && 
                    r.rating === row.rating &&
                    r.createdAt &&
                    Math.abs(new Date(r.createdAt).getTime() - submissionTime) < fiveSeconds
                );
                
                if (existingReview) {
                     if (row.subject_id && !existingReview.subjectIds?.includes(row.subject_id)) {
                        existingReview.subjectIds?.push(row.subject_id);
                        existingReview.subjectNames?.push(row.subject_name);
                    }
                } else {
                     reviews.push({
                        id: row.id,
                        text: row.text,
                        rating: row.rating,
                        upvotes: row.upvotes,
                        downvotes: row.downvotes,
                        createdAt: row.created_at?.toISOString() || '',
                        report_count: row.report_count,
                        subjectId: row.subject_id,
                        subjectName: row.subject_name,
                        subjectIds: [row.subject_id],
                        subjectNames: [row.subject_name],
                    });
                }
            }
        });
        
        const teacher: Teacher = {
            id: teacherData.id,
            name: teacherData.name,
            reviews: reviews,
            subjects: allSubjects,
            averageRating: calculateAverageRating(reviews),
        };
        
        return teacher;

    } catch (error) {
        console.error(`Erro ao buscar professor com ID ${teacherId}:`, error);
        return null;
    } finally {
        client.release();
    }
}

export async function addProfessorRequest(data: {
    professorName: string;
    email: string;
    message: string;
}): Promise<void> {
    const client = await pool.connect();
    try {
        const query = `
            INSERT INTO professor_requests (professor_name, email, message)
            VALUES ($1, $2, $3)
        `;
        await client.query(query, [data.professorName, data.email, data.message]);
    } catch (error) {
        console.error("Erro ao salvar solicitação do professor:", error);
        throw new Error("Falha ao salvar a solicitação no banco de dados.");
    } finally {
        client.release();
    }
}

export async function getSubjectById(subjectId: number): Promise<{
    id: number;
    name: string;
    iconName: string;
    reviews: any[];
} | null> {
    const client = await pool.connect();
    try {
        const subjectResult = await client.query("SELECT id, name FROM subjects WHERE id = $1", [subjectId]);
        if (subjectResult.rowCount === 0) {
            return null;
        }
        const subjectData = subjectResult.rows[0];

        const reviewsQuery = `
            SELECT
                r.id as review_id,
                r.text as review_text,
                r.rating as review_rating,
                r.upvotes as review_upvotes,
                r.downvotes as review_downvotes,
                r.created_at as review_created_at,
                r.report_count,
                t.id as teacher_id,
                t.name as teacher_name
            FROM reviews r
            JOIN teachers t ON r.teacher_id = t.id
            WHERE r.subject_id = $1 AND r.reported = false;
        `;
        const reviewsResult = await client.query(reviewsQuery, [subjectId]);

        return {
            id: subjectData.id,
            name: subjectData.name,
            iconName: assignIconName(subjectData.name),
            reviews: reviewsResult.rows,
        };

    } catch (error) {
        console.error(`Error fetching subject by ID ${subjectId}:`, error);
        return null;
    } finally {
        client.release();
    }
}

export async function getPlatformStats(): Promise<{ totalTeachers: number; totalReviews: number; newReviewsThisWeek: number; }> {
    const client = await pool.connect();
    try {
        const teachersQuery = client.query('SELECT COUNT(*) as count FROM teachers;');
        const reviewsQuery = client.query('SELECT COUNT(*) as count FROM reviews WHERE reported = false;');
        // This query correctly calculates the start of the week as Sunday.
        const weeklyReviewsQuery = client.query(`
            SELECT COUNT(*) as count 
            FROM reviews 
            WHERE 
                reported = false AND 
                created_at >= date_trunc('week', NOW() AT TIME ZONE 'UTC');
        `);

        const [teachersResult, reviewsResult, weeklyReviewsResult] = await Promise.all([
            teachersQuery,
            reviewsQuery,
            weeklyReviewsQuery
        ]);

        return {
            totalTeachers: parseInt(teachersResult.rows[0].count, 10),
            totalReviews: parseInt(reviewsResult.rows[0].count, 10),
            newReviewsThisWeek: parseInt(weeklyReviewsResult.rows[0].count, 10),
        };
    } catch (error) {
        console.error("Erro ao buscar estatísticas da plataforma:", error);
        return { totalTeachers: 0, totalReviews: 0, newReviewsThisWeek: 0 };
    } finally {
        client.release();
    }
}
