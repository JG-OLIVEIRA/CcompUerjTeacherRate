
import 'server-only';
import { Pool } from 'pg';

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
