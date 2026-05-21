"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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

const schema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email(),
  password: z.string().min(8),
});

type FormValues = z.infer<typeof schema>;

export default function JoinTeacherPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      await registerUser({ ...values, role: "teacher" });
      toast.success("Teacher account created");
      router.replace("/teacher/dashboard");
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Join as Teacher</CardTitle>
        <CardDescription>Create your teacher account and start publishing courses.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" autoComplete="name" {...form.register("fullName")} />
            {form.formState.errors.fullName?.message ? (
              <p className="text-sm text-red-400">{form.formState.errors.fullName.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
            {form.formState.errors.email?.message ? (
              <p className="text-sm text-red-400">{form.formState.errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete="new-password" {...form.register("password")} />
            {form.formState.errors.password?.message ? (
              <p className="text-sm text-red-400">{form.formState.errors.password.message}</p>
            ) : null}
          </div>

          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Creating..." : "Create teacher account"}
          </Button>

          <p className="text-center text-sm text-white/70">
            Want a student account?{" "}
            <Link href="/auth/sign-up" className="font-medium text-zinc-50 hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
