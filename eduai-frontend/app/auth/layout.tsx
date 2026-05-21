import { SiteHeader } from "@/components/layout/site-header";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-7xl flex-1 items-stretch px-4 py-10 md:py-14">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="flex items-center justify-center lg:justify-start">
            {children}
          </div>

          <section className="relative hidden lg:block">
            <div className="eduai-glass eduai-glow relative overflow-hidden rounded-3xl p-10">
              <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-fuchsia-400/15 blur-3xl" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5" />

              <div className="relative">
                <p className="text-sm font-medium text-white/70">EduAI Platform</p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50">
                  Premium learning experiences,
                  <br />
                  powered by AI.
                </h1>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/70">
                  Create courses faster, personalize content for every student, and
                  track learning outcomes in real time — all in one place.
                </p>

                <ul className="mt-6 grid gap-3 text-sm text-white/75">
                  <li className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-gradient-to-r from-cyan-300 to-indigo-300" />
                    AI-generated quizzes & assignments
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-gradient-to-r from-fuchsia-300 to-indigo-300" />
                    Auto-evaluation with instant feedback
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-gradient-to-r from-indigo-300 to-cyan-300" />
                    Analytics for teachers & admins
                  </li>
                </ul>

                <div className="mt-10 grid gap-4 rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-white/10 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-cyan-400/80 via-fuchsia-400/70 to-indigo-400/80" />
                      <div>
                        <div className="h-2.5 w-28 rounded bg-white/25" />
                        <div className="mt-2 h-2 w-20 rounded bg-white/15" />
                      </div>
                    </div>
                    <div className="h-7 w-24 rounded-full bg-white/10" />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="h-2 w-16 rounded bg-white/20" />
                      <div className="mt-3 h-7 w-20 rounded bg-white/10" />
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="h-2 w-14 rounded bg-white/20" />
                      <div className="mt-3 h-7 w-24 rounded bg-white/10" />
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="h-2 w-12 rounded bg-white/20" />
                      <div className="mt-3 h-7 w-16 rounded bg-white/10" />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between">
                      <div className="h-2 w-40 rounded bg-white/20" />
                      <div className="h-2 w-16 rounded bg-white/15" />
                    </div>
                    <div className="mt-4 space-y-3">
                      <div className="h-2 w-full rounded bg-white/10" />
                      <div className="h-2 w-11/12 rounded bg-white/10" />
                      <div className="h-2 w-10/12 rounded bg-white/10" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
