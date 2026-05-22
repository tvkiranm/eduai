import { SiteHeader } from "@/components/layout/site-header";

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
              <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-indigo-600/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-fuchsia-600/10 blur-3xl" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-600/5 via-transparent to-fuchsia-600/5" />

              <div className="relative">
                <p className="text-sm font-medium text-[color:var(--color-muted-foreground)]">
                  Secure account recovery
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[color:var(--color-foreground)]">
                  Reset your password,
                  <br />
                  get back to learning.
                </h1>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-[color:var(--color-muted-foreground)]">
                  Choose a strong password you haven&apos;t used before. If the link
                  is expired, request a new one from the sign-in page.
                </p>

                <ul className="mt-6 grid gap-3 text-sm text-[color:var(--color-muted-foreground)]">
                  <li className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-gradient-to-r from-indigo-600 to-fuchsia-600" />
                    Link expires automatically
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600" />
                    Token can be used once
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-gradient-to-r from-fuchsia-600 to-indigo-600" />
                    Protected by rate limits
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

