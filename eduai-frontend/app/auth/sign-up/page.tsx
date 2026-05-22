"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/components/providers/auth-provider";
import { getErrorMessage } from "@/lib/api";
import type { UserRole } from "@/lib/types";

const schema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["student", "teacher", "admin"]),
});

type FormValues = z.infer<typeof schema>;

export default function SignUpPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      role: "student",
    },
  });

  const roleValue = useWatch({ control: form.control, name: "role" });

  async function onSubmit(values: FormValues) {
    try {
      await registerUser(
        values as {
          fullName: string;
          email: string;
          password: string;
          role: UserRole;
        },
      );
      toast.success("Account created");
      // AuthProvider auto-logins, so go to dashboard
      const role = values.role;
      router.replace(
        role === "admin"
          ? "/admin/dashboard"
          : role === "teacher"
            ? "/teacher/dashboard"
            : "/student/dashboard",
      );
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create account</CardTitle>
        <CardDescription>Sign up to start using EduAI.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              autoComplete="name"
              {...form.register("fullName")}
            />
            {form.formState.errors.fullName?.message ? (
              <p className="text-sm text-red-400">
                {form.formState.errors.fullName.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              {...form.register("email")}
            />
            {form.formState.errors.email?.message ? (
              <p className="text-sm text-red-400">
                {form.formState.errors.email.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              {...form.register("password")}
            />
            {form.formState.errors.password?.message ? (
              <p className="text-sm text-red-400">
                {form.formState.errors.password.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Select
              value={roleValue}
              onValueChange={(v) =>
                form.setValue("role", v as FormValues["role"])
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.role?.message ? (
              <p className="text-sm text-red-400">
                {form.formState.errors.role.message}
              </p>
            ) : null}
            <p className="text-xs text-[color:var(--color-muted-foreground)]">
              Admin accounts are typically created by the organization.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Creating..." : "Create account"}
          </Button>

          <p className="text-center text-sm text-[color:var(--color-muted-foreground)]">
            Already have an account?{" "}
            <Link
              href="/auth/sign-in"
              className="font-medium text-[color:var(--color-foreground)] hover:underline"
            >
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
