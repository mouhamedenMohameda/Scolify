"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@school-admin/shared";
import { Button, Input } from "@school-admin/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@school-admin/ui";
import { apiPost } from "@/lib/api-client";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiPost<{ user: unknown }>(
        "/auth/register",
        data
      );

      if (response.success) {
        // Redirect to login
        router.push("/login?registered=true");
      } else {
        setError(response.error || "Registration failed");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Créer un compte</CardTitle>
          <CardDescription>
            Créez votre compte pour accéder à la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium">
                  Prénom
                </label>
                <Input
                  id="firstName"
                  placeholder="Jean"
                  {...register("firstName")}
                  className={errors.firstName ? "border-red-500" : ""}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-600">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium">
                  Nom
                </label>
                <Input
                  id="lastName"
                  placeholder="Dupont"
                  {...register("lastName")}
                  className={errors.lastName ? "border-red-500" : ""}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-600">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                {...register("email")}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                Téléphone (optionnel)
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="+33123456789"
                {...register("phone")}
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && (
                <p className="text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Mot de passe
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && (
                <p className="text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Minimum 8 caractères, avec majuscule, minuscule et chiffre
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Création..." : "Créer mon compte"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Déjà un compte ? </span>
            <a
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Se connecter
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
