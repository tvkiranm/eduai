"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/providers/auth-provider";
import { api, getErrorMessage } from "@/lib/api";
import { getUser } from "@/lib/storage";
import type { User } from "@/lib/types";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormValues = z.infer<typeof schema>;

const forgotSchema = z.object({
  email: z.string().email(),
});

type ForgotValues = z.infer<typeof forgotSchema>;

export function SignInClient() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next");
  const { login } = useAuth();
  const [mode, setMode] = React.useState<"signin" | "forgot">("signin");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const forgotForm = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
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

  async function onForgotSubmit(values: ForgotValues) {
    try {
      const res = await api.auth.forgotPassword(values);
      toast.success(res.message || "Reset link sent. Please check your email.");
      setMode("signin");
      form.setValue("email", values.email);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{mode === "forgot" ? "Forgot password" : "Sign in"}</CardTitle>
        <CardDescription>
          {mode === "forgot"
            ? "Enter your email and we’ll send a password reset link."
            : "Access your dashboard with your email and password."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {mode === "forgot" ? (
          <form
            onSubmit={forgotForm.handleSubmit(onForgotSubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="forgot-email">Email</Label>
              <Input
                id="forgot-email"
                type="email"
                autoComplete="email"
                {...forgotForm.register("email")}
              />
              {forgotForm.formState.errors.email?.message ? (
                <p className="text-sm text-red-400">
                  {forgotForm.formState.errors.email.message}
                </p>
              ) : null}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={forgotForm.formState.isSubmitting}
            >
              {forgotForm.formState.isSubmitting ? "Sending..." : "Send reset link"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setMode("signin")}
            >
              Back to sign in
            </Button>
          </form>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
              {form.formState.errors.email?.message ? (
                <p className="text-sm text-red-400">{form.formState.errors.email.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  onClick={() => {
                    setMode("forgot");
                    forgotForm.setValue("email", form.getValues("email"));
                  }}
                  className="text-sm font-medium text-[color:var(--color-foreground)] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
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

            <p className="text-center text-sm text-[color:var(--color-muted-foreground)]">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/sign-up"
                className="font-medium text-[color:var(--color-foreground)] hover:underline"
              >
                Sign up
              </Link>
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
