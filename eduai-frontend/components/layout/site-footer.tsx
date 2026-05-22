import Link from "next/link";
import { Container } from "@/components/layout/container";

export function SiteFooter() {
  return (
    <footer id="contact" className="mt-12 border-t border-[color:var(--color-border)]">
      <Container className="grid grid-cols-1 gap-8 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="text-lg font-semibold text-[color:var(--color-foreground)]">EduAI</div>
          <p className="mt-2 max-w-md text-sm text-[color:var(--color-muted-foreground)]">
            A modern education platform for Admins, Teachers, and Students—built
            for speed, clarity, and great learning outcomes.
          </p>
        </div>
        <div>
          <div className="text-sm font-semibold text-[color:var(--color-foreground)]">Product</div>
          <ul className="mt-3 space-y-2 text-sm text-[color:var(--color-muted-foreground)]">
            <li>
              <a href="#features" className="hover:text-[color:var(--color-foreground)]">
                Features
              </a>
            </li>
            <li>
              <a href="#pricing" className="hover:text-[color:var(--color-foreground)]">
                Pricing
              </a>
            </li>
            <li>
              <a href="#how" className="hover:text-[color:var(--color-foreground)]">
                How it works
              </a>
            </li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-semibold text-[color:var(--color-foreground)]">Account</div>
          <ul className="mt-3 space-y-2 text-sm text-[color:var(--color-muted-foreground)]">
            <li>
              <Link href="/auth/sign-in" className="hover:text-[color:var(--color-foreground)]">
                Sign in
              </Link>
            </li>
            <li>
              <Link href="/auth/sign-up" className="hover:text-[color:var(--color-foreground)]">
                Sign up
              </Link>
            </li>
            <li>
              <Link href="/auth/join-teacher" className="hover:text-[color:var(--color-foreground)]">
                Join as Teacher
              </Link>
            </li>
          </ul>
        </div>
      </Container>
      <div className="border-t border-[color:var(--color-border)] py-6 text-center text-xs text-[color:var(--color-muted-foreground)]">
        © {new Date().getFullYear()} EduAI. All rights reserved.
      </div>
    </footer>
  );
}
