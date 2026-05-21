import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-12">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="text-lg font-semibold text-zinc-50">EduAI</div>
          <p className="mt-2 max-w-md text-sm text-white/65">
            A modern education platform for Admins, Teachers, and Students—built
            for speed, clarity, and great learning outcomes.
          </p>
        </div>
        <div>
          <div className="text-sm font-semibold text-zinc-50">Product</div>
          <ul className="mt-3 space-y-2 text-sm text-white/65">
            <li>
              <a href="#features" className="hover:text-white">
                Features
              </a>
            </li>
            <li>
              <a href="#pricing" className="hover:text-white">
                Pricing
              </a>
            </li>
            <li>
              <a href="#how" className="hover:text-white">
                How it works
              </a>
            </li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-semibold text-zinc-50">Account</div>
          <ul className="mt-3 space-y-2 text-sm text-white/65">
            <li>
              <Link href="/auth/sign-in" className="hover:text-white">
                Sign in
              </Link>
            </li>
            <li>
              <Link href="/auth/sign-up" className="hover:text-white">
                Sign up
              </Link>
            </li>
            <li>
              <Link href="/auth/join-teacher" className="hover:text-white">
                Join as Teacher
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-white/50">
        © {new Date().getFullYear()} EduAI. All rights reserved.
      </div>
    </footer>
  );
}
