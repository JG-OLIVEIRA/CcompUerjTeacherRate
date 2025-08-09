
import 'server-only';
import { Pool } from 'pg';
import { TimeSpan, createDate } from 'oslo';
import { generateId } from 'lucia';

// A instância do Pool será criada apenas uma vez e reutilizada
// em todas as chamadas de função do servidor.
// O Next.js carrega automaticamente as variáveis de ambiente de um arquivo .env.
// Para habilitar o SSL em produção, adicione "?ssl=true" ao final da sua DATABASE_URL.
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
      rejectUnauthorized: false
  }
});

export const db = {
    query: (text: string, params: any[]) => pool.query(text, params),
};

export async function createPasswordResetToken(userId: string): Promise<string> {
    const client = await pool.connect();
    try {
        await client.query("DELETE FROM password_reset_token WHERE user_id = $1", [userId]);
        const tokenId = generateId(40);
        await client.query("INSERT INTO password_reset_token (id, user_id, expires_at) VALUES ($1, $2, $3)", 
            [tokenId, userId, createDate(new TimeSpan(2, "h"))]);
        return tokenId;
    } finally {
        client.release();
    }
}
