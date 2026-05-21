import { SiteHeader } from "@/components/layout/site-header";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto flex max-w-6xl flex-1 items-center justify-center px-4 py-10">
        {children}
      </div>
    </div>
  );
}
