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
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FeaturedCourses } from "@/components/courses/featured-courses";

const features = [
  {
    title: "AI‑Powered Learning",
    description:
      "Get personalized recommendations and smart learning paths.",
    icon: Sparkles,
  },
  {
    title: "Expert Instructors",
    description:
      "Learn from industry experts and top educators.",
    icon: Users,
  },
  {
    title: "Flexible Learning",
    description:
      "Study at your own pace, anytime and anywhere.",
    icon: Video,
  },
  {
    title: "Certificates",
    description:
      "Earn recognized certificates to boost your career.",
    icon: CheckCircle2,
  },
] as const;

const categories = [
  { title: "Development", desc: "120+ Courses" },
  { title: "Design", desc: "80+ Courses" },
  { title: "Business", desc: "100+ Courses" },
  { title: "Marketing", desc: "70+ Courses" },
  { title: "AI & Data Science", desc: "90+ Courses" },
] as const;

const testimonials = [
  {
    quote:
      "EduAI transformed the way I learn. The courses are practical and the platform is smooth.",
    name: "Priya Sharma",
    role: "Frontend Developer",
  },
  {
    quote:
      "The UI is beautiful and the learning path feels super structured. Highly recommended.",
    name: "Rahul Verma",
    role: "Product Manager",
  },
  {
    quote:
      "Great content and an amazing support experience. The course cards and dashboard are very clean.",
    name: "Ananya Singh",
    role: "UI/UX Designer",
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
      <section className="border-b border-[color:var(--color-border)]">
        <Container className="grid grid-cols-1 gap-10 py-14 md:grid-cols-2 md:py-20">
          <div className="flex flex-col justify-center">
            <Badge variant="secondary" className="w-fit">
              Beautiful landing page + powerful dashboard
            </Badge>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[color:var(--color-foreground)] md:text-5xl">
              Learn smarter with{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                AI‑Powered
              </span>{" "}
              education
            </h1>
            <p className="mt-4 text-lg text-[color:var(--color-muted-foreground)]">
              Discover high-quality courses, personalized learning paths, and AI tools
              to help you achieve your goals faster.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/auth/sign-up">
                  Get Started Free <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/student/browse">Explore Courses</Link>
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-[color:var(--color-muted-foreground)]">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-600" /> Role-based portals
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-600" /> Modern UI components
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-xl">
              <div className="absolute -inset-6 rounded-[32px] bg-gradient-to-br from-indigo-600/10 via-violet-600/10 to-fuchsia-600/10 blur-2xl" />
              <div className="relative rounded-[32px] border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-6 shadow-xl shadow-indigo-500/10">
                <div className="grid gap-4">
                  <Card className="eduai-glow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">AI Tutor</CardTitle>
                          <CardDescription>24/7 Support</CardDescription>
                        </div>
                        <Badge>Online</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-xl bg-[color:var(--color-muted)] p-3">
                        <div className="text-xs text-[color:var(--color-muted-foreground)]">Track</div>
                        <div className="mt-1 font-semibold text-[color:var(--color-foreground)]">
                          Data Science
                        </div>
                      </div>
                      <div className="rounded-xl bg-[color:var(--color-muted)] p-3">
                        <div className="text-xs text-[color:var(--color-muted-foreground)]">Progress</div>
                        <div className="mt-1 font-semibold text-[color:var(--color-foreground)]">68%</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Personalized learning path</CardTitle>
                      <CardDescription>Step-by-step roadmap</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        { title: "Python basics", desc: "Syntax, data types, and practice.", status: "Active" },
                        { title: "SQL + databases", desc: "Queries, joins, schemas.", status: "Locked" },
                        { title: "ML essentials", desc: "Core concepts and training.", status: "Locked" },
                      ].map((step) => (
                        <div
                          key={step.title}
                          className="flex items-start justify-between gap-4 rounded-2xl bg-[color:var(--color-muted)] p-4"
                        >
                          <div>
                            <div className="font-semibold text-[color:var(--color-foreground)]">
                              {step.title}
                            </div>
                            <div className="mt-1 text-sm text-[color:var(--color-muted-foreground)]">
                              {step.desc}
                            </div>
                          </div>
                          {step.status === "Active" ? (
                            <Badge variant="secondary">Active</Badge>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-[color:var(--color-muted-foreground)]">
                              <Lock className="h-3.5 w-3.5" /> Locked
                            </span>
                          )}
                        </div>
                      ))}

                      <div className="rounded-2xl bg-[color:var(--color-muted)] p-4">
                        <div className="text-xs font-semibold text-[color:var(--color-muted-foreground)]">
                          Progress tracker
                        </div>
                        <div className="mt-2 h-2 w-full rounded-full bg-black/5">
                          <div className="h-2 w-[68%] rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600" />
                        </div>
                        <div className="mt-2 text-xs text-[color:var(--color-muted-foreground)]">
                          Current step: 68% complete
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Intro */}
      <section id="about" className="py-14">
        <Container>
        <h2 className="text-2xl font-semibold tracking-tight text-[color:var(--color-foreground)]">
          Platform introduction
        </h2>
        <p className="mt-3 max-w-3xl text-[color:var(--color-muted-foreground)]">
          EduAI is a clean, scalable UI that connects to your NestJS backend
          APIs. It handles authentication, role-based navigation, and modern
          dashboard UX.
        </p>
        </Container>
      </section>

      <FeaturedCourses />

      {/* Popular categories */}
      <section className="py-14">
        <Container>
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-[color:var(--color-foreground)]">
                Popular categories
              </h2>
              <p className="mt-2 text-[color:var(--color-muted-foreground)]">
                Start with a category that matches your goals.
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {categories.map((c) => (
              <Card key={c.title} className="hover:eduai-glow transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base">{c.title}</CardTitle>
                  <CardDescription>{c.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Why choose */}
      <section id="features" className="border-y border-[color:var(--color-border)]">
        <Container className="py-14">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-[color:var(--color-foreground)]">Why Choose EduAI?</h2>
              <p className="mt-2 text-[color:var(--color-muted-foreground)]">A modern learning experience built for outcomes.</p>
            </div>
            <Button asChild variant="outline" className="hidden sm:inline-flex">
              <Link href="/auth/sign-in">Sign in</Link>
            </Button>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-4">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <Card key={f.title}>
                  <CardHeader>
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[color:var(--color-muted)] text-[color:var(--color-foreground)]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <CardTitle className="mt-3 text-base">{f.title}</CardTitle>
                    <CardDescription>{f.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </Container>
      </section>

      {/* How it works */}
      <section id="how" className="py-14">
        <Container>
        <h2 className="text-2xl font-semibold tracking-tight text-[color:var(--color-foreground)]">
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
        </Container>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-[color:var(--color-border)]">
        <Container className="py-14">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-[color:var(--color-foreground)]">
                Subscription / pricing
              </h2>
              <p className="mt-2 text-[color:var(--color-muted-foreground)]">
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
                  <ul className="space-y-2 text-sm text-[color:var(--color-muted-foreground)]">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-indigo-600" />{" "}
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
        </Container>
      </section>

      {/* Testimonials */}
      <section className="py-14">
        <Container>
          <h2 className="text-2xl font-semibold tracking-tight text-[color:var(--color-foreground)]">
            What our learners say
          </h2>
          <p className="mt-2 text-[color:var(--color-muted-foreground)]">
            Trusted by learners who want real outcomes.
          </p>
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.name}>
                <CardHeader>
                  <CardDescription>“{t.quote}”</CardDescription>
                  <div className="mt-4">
                    <div className="text-sm font-semibold text-[color:var(--color-foreground)]">{t.name}</div>
                    <div className="text-xs text-[color:var(--color-muted-foreground)]">{t.role}</div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-14">
        <Container>
        <div className="rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 p-[1px]">
          <div className="rounded-3xl bg-[color:var(--color-card)] p-8">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h3 className="text-xl font-semibold text-[color:var(--color-foreground)]">
                Ready to teach on EduAI?
              </h3>
              <p className="mt-2 text-[color:var(--color-muted-foreground)]">
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
        </div>
        </Container>
      </section>

      <SiteFooter />
    </div>
  );
}
