import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Lock,
  Sparkles,
  Users,
  Video,
} from "lucide-react";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    title: "Role-based portals",
    description:
      "Dedicated dashboards for Admin, Teacher, and Student with clear permissions.",
    icon: Users,
  },
  {
    title: "Course creation + management",
    description:
      "Create, edit, publish courses, and manage thumbnails via Media upload.",
    icon: Video,
  },
  {
    title: "Fast, modern UX",
    description:
      "Responsive UI with reusable components, loading states, and clean layouts.",
    icon: Sparkles,
  },
] as const;

const pricing = [
  {
    name: "Starter",
    price: "Free",
    desc: "Perfect for trying the platform.",
    features: ["Browse courses", "Enroll in free courses", "Student dashboard"],
    highlight: false,
  },
  {
    name: "Teacher",
    price: "₹999/mo",
    desc: "For educators building courses.",
    features: [
      "Teacher dashboard",
      "Create & edit courses",
      "View enrolled students",
    ],
    highlight: true,
  },
  {
    name: "Organization",
    price: "Custom",
    desc: "Admin control + reporting.",
    features: [
      "Admin dashboard",
      "Manage users",
      "Manage categories & courses",
    ],
    highlight: false,
  },
] as const;

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Hero */}
      <section className="border-b border-white/10">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div className="flex flex-col justify-center">
            <Badge variant="secondary" className="w-fit">
              Modern web education platform
            </Badge>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-50 md:text-5xl">
              Build courses. Teach better. Learn faster.
            </h1>
            <p className="mt-4 text-lg text-white/70">
              EduAI provides role-based dashboards, course management,
              enrollments, and media uploads—integrated with your existing
              backend APIs.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/auth/sign-up">
                  Get started <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/auth/join-teacher">Join as Teacher</Link>
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap gap-4 text-sm text-white/70">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Admin,
                Teacher, Student roles
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> JWT auth +
                role redirects
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="w-full rounded-3xl eduai-glass p-6">
              <div className="grid gap-4">
                <Card className="eduai-glow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">
                          Student profile
                        </CardTitle>
                        <CardDescription>Personalized roadmap</CardDescription>
                      </div>
                      <Badge>Active</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-white/5 p-3">
                      <div className="text-xs text-white/60">Track</div>
                      <div className="mt-1 font-semibold text-zinc-50">
                        Data Scientist
                      </div>
                    </div>
                    <div className="rounded-xl bg-white/5 p-3">
                      <div className="text-xs text-white/60">Progress</div>
                      <div className="mt-1 font-semibold text-zinc-50">35%</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      Your smart roadmap
                    </CardTitle>
                    <CardDescription>
                      Step-by-step learning plan
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      {
                        title: "Python basics",
                        desc: "Syntax, data types, and problem solving.",
                        status: "Active",
                      },
                      {
                        title: "SQL + databases",
                        desc: "Queries, joins, and schema design.",
                        status: "Locked",
                      },
                      {
                        title: "ML essentials",
                        desc: "Core concepts and model training.",
                        status: "Locked",
                      },
                    ].map((step) => (
                      <div
                        key={step.title}
                        className="flex items-start justify-between gap-4 rounded-2xl bg-white/5 p-4"
                      >
                        <div>
                          <div className="font-semibold text-zinc-50">
                            {step.title}
                          </div>
                          <div className="mt-1 text-sm text-white/65">
                            {step.desc}
                          </div>
                        </div>
                        {step.status === "Active" ? (
                          <Badge variant="secondary">Active</Badge>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-white/55">
                            <Lock className="h-3.5 w-3.5" /> Locked
                          </span>
                        )}
                      </div>
                    ))}

                    <div className="rounded-2xl bg-white/5 p-4">
                      <div className="text-xs font-semibold text-white/70">
                        Progress tracker
                      </div>
                      <div className="mt-2 h-2 w-full rounded-full bg-white/10">
                        <div className="h-2 w-[35%] rounded-full bg-gradient-to-r from-cyan-400/90 via-fuchsia-400/90 to-indigo-400/90" />
                      </div>
                      <div className="mt-2 text-xs text-white/60">
                        Current step: 35% complete
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-50">
          Platform introduction
        </h2>
        <p className="mt-3 max-w-3xl text-white/70">
          EduAI is a clean, scalable UI that connects to your NestJS backend
          APIs. It handles authentication, role-based navigation, and modern
          dashboard UX.
        </p>
      </section>

      {/* Features / Instructions */}
      <section id="features" className="border-y border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-50">
                Features & instructions
              </h2>
              <p className="mt-2 text-white/70">
                Everything you need to run an education platform.
              </p>
            </div>
            <Button asChild variant="outline" className="hidden sm:inline-flex">
              <Link href="/auth/sign-in">Sign in</Link>
            </Button>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <Card key={f.title}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-zinc-50">
                        <Icon className="h-5 w-5" />
                      </span>
                      <CardTitle className="text-base">{f.title}</CardTitle>
                    </div>
                    <CardDescription>{f.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-50">
          How it works
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            {
              step: "1",
              title: "Create account",
              desc: "Sign up as Student or Teacher and login using JWT.",
            },
            {
              step: "2",
              title: "Create / manage content",
              desc: "Teachers create courses; Admins manage users & categories.",
            },
            {
              step: "3",
              title: "Enroll & learn",
              desc: "Students enroll in courses and track progress in dashboards.",
            },
          ].map((s) => (
            <Card key={s.step}>
              <CardHeader>
                <Badge className="w-fit">{s.step}</Badge>
                <CardTitle className="text-base">{s.title}</CardTitle>
                <CardDescription>{s.desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-50">
                Subscription / pricing
              </h2>
              <p className="mt-2 text-white/70">
                Choose a plan that fits your goals.
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            {pricing.map((p) => (
              <Card
                key={p.name}
                className={p.highlight ? "eduai-glow" : undefined}
              >
                <CardHeader>
                  <CardTitle className="text-base">{p.name}</CardTitle>
                  <div className="mt-2 text-3xl font-semibold">{p.price}</div>
                  <CardDescription>{p.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-white/70">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />{" "}
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6">
                    <Button
                      asChild
                      className="w-full"
                      variant={p.highlight ? "default" : "outline"}
                    >
                      <Link
                        href={
                          p.name === "Teacher"
                            ? "/auth/join-teacher"
                            : "/auth/sign-up"
                        }
                      >
                        {p.name === "Organization"
                          ? "Contact sales"
                          : "Get started"}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="rounded-3xl eduai-glass p-8">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h3 className="text-xl font-semibold text-zinc-50">
                Ready to teach on EduAI?
              </h3>
              <p className="mt-2 text-white/70">
                Join as a teacher and publish your first course today.
              </p>
            </div>
            <Button asChild size="lg">
              <Link href="/auth/join-teacher">
                Join as Teacher <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
