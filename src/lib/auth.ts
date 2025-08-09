
import { Lucia } from "lucia";
import * as LuciaPostgres from "@lucia-auth/adapter-postgresql";
import { pool } from "./db";

const adapter = new LuciaPostgres.PostgreSQLAdapter(pool, {
	user: "auth_user",
	session: "user_session"
});

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		expires: false,
		attributes: {
			secure: process.env.NODE_ENV === "production"
		}
	},
    getUserAttributes: (attributes) => {
        return {
            email: attributes.email
        }
    }
});

declare module "lucia" {
	interface Register {
		Lucia: typeof lucia;
        DatabaseUserAttributes: DatabaseUserAttributes;
	}
}

interface DatabaseUserAttributes {
    email: string;
}
