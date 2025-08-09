
"use client";

import { useFormState } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "./actions";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Mail } from "lucide-react";

export default function LoginForm() {
	const [result, action] = useFormState(login, undefined);
    const [submitted, setSubmitted] = useState(false);
    const { toast } = useToast();

	useEffect(() => {
		if (result) {
            if (result.success) {
                setSubmitted(true);
                toast({
                    title: "Link mágico enviado!",
                    description: "Verifique seu e-mail para acessar sua conta.",
                });
            } else if (result.error) {
                toast({
                    variant: "destructive",
                    title: "Erro ao enviar e-mail",
                    description: result.error,
                });
            }
        }
	}, [result, toast]);

    if (submitted) {
        return (
            <div className="text-center bg-secondary/50 border border-primary/20 rounded-lg p-8 space-y-4">
                <Mail className="mx-auto h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Verifique seu E-mail</h3>
                <p className="text-muted-foreground">
                    Enviamos um link de acesso para o e-mail fornecido. Por favor, clique no link para completar o login. Você pode fechar esta janela.
                </p>
            </div>
        )
    }

	return (
		<form action={action} className="space-y-6">
            <div>
                <Label htmlFor="email" className="sr-only">
                    Email
                </Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                />
            </div>

			<Button type="submit" className="w-full">
				Enviar Link Mágico
			</Button>

			{result?.error && (
				<p className="text-sm font-medium text-destructive text-center">{result.error}</p>
			)}
		</form>
	);
}
