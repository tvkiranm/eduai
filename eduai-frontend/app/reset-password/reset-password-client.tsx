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
import { api, getErrorMessage } from "@/lib/api";

const schema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type FormValues = z.infer<typeof schema>;

export function ResetPasswordClient() {
  const router = useRouter();
  const search = useSearchParams();
  const token = search.get("token") ?? "";

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onSubmit(values: FormValues) {
    if (!token) {
      toast.error("Missing reset token. Please request a new link.");
      return;
    }

    try {
      const res = await api.auth.resetPassword({
        token,
        password: values.password,
      });
      toast.success(res.message || "Password updated. Please sign in.");
      router.replace("/auth/sign-in");
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Reset password</CardTitle>
        <CardDescription>Set a new password for your account.</CardDescription>
      </CardHeader>
      <CardContent>
        {!token ? (
          <div className="space-y-4">
            <p className="text-sm text-[color:var(--color-muted-foreground)]">
              This reset link is missing a token or is invalid. Please request a new link.
            </p>
            <Button asChild className="w-full">
              <Link href="/auth/sign-in">Back to sign in</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                {...form.register("password")}
              />
              {form.formState.errors.password?.message ? (
                <p className="text-sm text-red-400">{form.formState.errors.password.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...form.register("confirmPassword")}
              />
              {form.formState.errors.confirmPassword?.message ? (
                <p className="text-sm text-red-400">
                  {form.formState.errors.confirmPassword.message}
                </p>
              ) : null}
            </div>

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Updating..." : "Update password"}
            </Button>

            <Button asChild type="button" variant="ghost" className="w-full">
              <Link href="/auth/sign-in">Back to sign in</Link>
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

