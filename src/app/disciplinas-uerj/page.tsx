
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getUerjSubjects, type UerjSubjectOutput } from '@/app/actions/scrape-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, AlertTriangle, ListChecks } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  matricula: z.string().min(1, 'Matrícula é obrigatória.'),
  senha: z.string().min(1, 'Senha é obrigatória.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function ScrapePage() {
  const [data, setData] = useState<UerjSubjectOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      matricula: '',
      senha: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const result = await getUerjSubjects(values);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ocorreu um erro desconhecido.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
             <ListChecks className="h-6 w-6 text-primary"/>
            Consultar Disciplinas e Turmas da UERJ
          </CardTitle>
          <CardDescription>
            Insira seus dados de acesso ao Aluno Online para buscar as disciplinas e turmas disponíveis. Suas credenciais são usadas apenas para esta consulta e não são armazenadas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="matricula"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Matrícula</FormLabel>
                    <FormControl>
                      <Input placeholder="Sua matrícula" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="senha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Sua senha" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  'Buscar Disciplinas'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {error && (
        <div className="flex items-center gap-3 p-4 mb-8 text-destructive-foreground bg-destructive rounded-lg">
          <AlertTriangle className="h-6 w-6"/>
          <div>
            <p className="font-bold">Ocorreu um erro</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {data && (
        <div>
            <h2 className="text-2xl font-bold mb-4">Resultados da Busca</h2>
            {data.disciplinas.length > 0 ? (
                <Accordion type="single" collapsible className="w-full space-y-2">
                {data.disciplinas.map((disciplina, index) => (
                    <AccordionItem value={`item-${index}`} key={index} className="bg-card border rounded-lg">
                        <AccordionTrigger className="px-4 text-lg hover:no-underline">
                           {disciplina.nome}
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                            {disciplina.turmas.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Turma</TableHead>
                                            <TableHead>Docente</TableHead>
                                            <TableHead>Horários</TableHead>
                                            <TableHead>Local</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {disciplina.turmas.map((turma, turmaIndex) => (
                                            <TableRow key={turmaIndex}>
                                                <TableCell>{turma.Turma}</TableCell>
                                                <TableCell>{turma.Docente || 'N/A'}</TableCell>
                                                <TableCell>
                                                    {turma.Tempos?.map(([dia, horario], i) => (
                                                        <div key={i}>{`${dia}: ${horario}`}</div>
                                                    )) || 'N/A'}
                                                </TableCell>
                                                <TableCell>{turma.Local || 'N/A'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <p className="text-muted-foreground text-center p-4">Nenhuma turma encontrada para esta disciplina.</p>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
            ) : (
                <p className="text-center text-muted-foreground py-8">Nenhuma disciplina encontrada.</p>
            )}
        </div>
      )}
    </div>
  );
}
