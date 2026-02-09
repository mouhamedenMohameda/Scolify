import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@school-admin/ui";
import { Button } from "@school-admin/ui";
import Link from "next/link";

export default async function Home() {
  const session = await getCurrentSession();

  // Redirect to dashboard if authenticated
  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>School Administration System</CardTitle>
          <CardDescription>
            SaaS multi-tenant de gestion scolaire complète
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Bienvenue sur la plateforme de gestion scolaire.
          </p>
          <div className="flex gap-2">
            <Link href="/login">
              <Button>Se connecter</Button>
            </Link>
            <Link href="/register">
              <Button variant="outline">Créer un compte</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
