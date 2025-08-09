
import { lucia } from "@/lib/auth";
import { db, pool } from "@/lib/db";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
	const url = new URL(request.url);
	const token = url.searchParams.get("token");

	if (!token) {
		return new NextResponse(null, {
			status: 400
		});
	}

    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        
        const { rows: tokens } = await client.query("SELECT * FROM password_reset_token WHERE id = $1", [token]);
        const dbToken = tokens[0];

        if (dbToken) {
            await client.query("DELETE FROM password_reset_token WHERE id = $1", [token]);
        } else {
             await client.query("ROLLBACK");
            return new NextResponse("Token inválido ou expirado", {
                status: 400
            });
        }
        
        const isExpired = new Date() > new Date(dbToken.expires_at);
        if (isExpired) {
            await client.query("ROLLBACK");
            return new NextResponse("Token inválido ou expirado", {
                status: 400
            });
        }

        const session = await lucia.createSession(dbToken.user_id, {});
        const sessionCookie = lucia.createSessionCookie(session.id);
        cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
        
        await client.query("COMMIT");

        return new NextResponse(null, {
            status: 302,
            headers: {
                Location: "/"
            }
        });

    } catch (e) {
        await client.query("ROLLBACK");
        console.error(e);
        return new NextResponse("Ocorreu um erro desconhecido", {
            status: 500
        });
    } finally {
        client.release();
    }
}
