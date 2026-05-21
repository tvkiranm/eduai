import { Suspense } from "react";
import { LoadingState } from "@/components/layout/states";
import { SignInClient } from "./sign-in-client";

export default function SignInPage() {
  return (
    <Suspense fallback={<LoadingState label="Loading..." />}>
      <SignInClient />
    </Suspense>
  );
}

