"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/providers/auth-provider";
import { getErrorMessage } from "@/lib/api";
import { getUser } from "@/lib/storage";
import type { User } from "@/lib/types";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormValues = z.infer<typeof schema>;

export function SignInClient() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next");
  const { login } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: FormValues) {
    try {
      await login(values);
      toast.success("Welcome back!");

      const user = getUser<User>();
      const role = user?.role ?? "student";
      const target =
        next ||
        (role === "admin"
          ? "/admin/dashboard"
          : role === "teacher"
            ? "/teacher/dashboard"
            : "/student/dashboard");

      router.replace(target);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Access your dashboard with your email and password.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
            {form.formState.errors.email?.message ? (
              <p className="text-sm text-red-400">{form.formState.errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              {...form.register("password")}
            />
            {form.formState.errors.password?.message ? (
              <p className="text-sm text-red-400">{form.formState.errors.password.message}</p>
            ) : null}
          </div>

          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
          </Button>

          <p className="text-center text-sm text-white/70">
            Don&apos;t have an account?{" "}
            <Link href="/auth/sign-up" className="font-medium text-zinc-50 hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
