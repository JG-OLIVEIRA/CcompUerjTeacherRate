
"use server"

import { generateId } from "lucia";
import { db, createPasswordResetToken } from "@/lib/db";
import { lucia } from "@/lib/auth";
import { cookies }d' 'from "next/headers";
import { Resend } from "resend";
import { pool } from "@/lib/db";
import MagicLinkEmail from "@/emails/magic-link";

const resend = new Resend(process.env.RESEND_API_KEY);
const appUrl = process.env.APP_URL;


export async function login(_: any, formData: FormData): Promise<{ success?: boolean, error?: string }> {
    const email = formData.get("email");
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return {
            error: "E-mail inválido."
        }
    }

    const client = await pool.connect();
    try {
        let { rows: users } = await client.query("SELECT * FROM auth_user WHERE email = $1", [email]);
        let userId: string;

        if (users.length === 0) {
            userId = generateId(15);
            await client.query("INSERT INTO auth_user (id, email) VALUES ($1, $2)", [userId, email]);
        } else {
            userId = users[0].id;
        }

        const verificationToken = await createPasswordResetToken(userId);
        const verificationLink = `${appUrl}/api/auth/callback?token=${verificationToken}`;
        
        const { data, error } = await resend.emails.send({
            from: "CcompUerjTeacherRate <onboarding@resend.dev>",
            to: [email],
            subject: "Link de acesso para CcompUerjTeacherRate",
            react: MagicLinkEmail({ magicLink: verificationLink }),
        });

        if (error) {
            console.error({ error });
            return {
                error: "Não foi possível enviar o e-mail. Tente novamente."
            }
        }
       
        return { success: true };

    } catch (e) {
        console.error(e);
        return {
            error: "Ocorreu um erro. Tente novamente."
        }
    } finally {
        client.release();
    }
}
