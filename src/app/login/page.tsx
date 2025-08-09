
import { validateRequest } from "@/lib/auth-actions";
import { redirect } from "next/navigation";
import LoginForm from "./login-form";

export default async function Page() {
	const { user } = await validateRequest();
	if (user) {
		return redirect("/");
	}
	return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="max-w-md w-full p-8 space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground shine">
                        Acessar sua conta
                    </h2>
                    <p className="mt-2 text-center text-sm text-muted-foreground">
                        Enviaremos um link mágico para seu e-mail.
                    </p>
                </div>
		        <LoginForm />
            </div>
        </div>
	);
}
