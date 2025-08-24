
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wrench, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ScrapePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2">
            <Wrench className="h-6 w-6 text-primary" />
            Funcionalidade Descontinuada
          </CardTitle>
          <CardDescription>
            A consulta automática de disciplinas foi removida.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-4 text-center text-muted-foreground p-4">
            <p className="max-w-md">
              Agradecemos o seu interesse, mas esta funcionalidade foi descontinuada permanentemente devido a limitações técnicas do ambiente.
            </p>
            <Button asChild>
                <Link href="/subjects">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para Matérias
                </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
