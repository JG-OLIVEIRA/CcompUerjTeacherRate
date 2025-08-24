
'use server';

import { z } from 'zod';

// --- DEFINIÇÃO DOS SCHEMAS DE ENTRADA E SAÍDA ---

const UerjSubjectInputSchema = z.object({
  matricula: z.string().min(1, 'Matrícula é obrigatória.'),
  senha: z.string().min(1, 'Senha é obrigatória.'),
});
export type UerjSubjectInput = z.infer<typeof UerjSubjectInputSchema>;

const TurmaSchema = z.object({
  Turma: z.string().optional(),
  Docente: z.string().optional(),
  Local: z.string().optional(),
  Tempos: z.array(z.tuple([z.string(), z.string()])).optional(),
});

const DisciplinaSchema = z.object({
  nome: z.string(),
  turmas: z.array(TurmaSchema),
});

const UerjSubjectOutputSchema = z.object({
  disciplinas: z.array(DisciplinaSchema),
});
export type UerjSubjectOutput = z.infer<typeof UerjSubjectOutputSchema>;


/**
 * Busca as disciplinas e turmas do Aluno Online da UERJ.
 * ATENÇÃO: Esta funcionalidade está temporariamente desativada devido a
 * problemas de compatibilidade do ambiente.
 */
export async function getUerjSubjects(input: UerjSubjectInput): Promise<UerjSubjectOutput> {
  // Valida a entrada, mas não executa o scraping.
  const validation = UerjSubjectInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error('Dados de entrada inválidos.');
  }

  console.warn("A funcionalidade de scraping está temporariamente desativada.");

  // Lança um erro informando ao usuário que a funcionalidade está indisponível.
  throw new Error("Esta funcionalidade está temporariamente indisponível devido a limitações do ambiente. A equipe está trabalhando em uma solução.");

  // O código de scraping original foi removido para evitar erros de execução.
  // Em uma futura implementação, usaríamos um serviço de Remote WebDriver
  // ou uma abordagem diferente para contornar as restrições do sistema de arquivos.
  
  // Retorna um resultado vazio para satisfazer a tipagem, embora o erro acima impeça que chegue aqui.
  // return { disciplinas: [] };
}
