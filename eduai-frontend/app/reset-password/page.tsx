import { Suspense } from "react";
import { LoadingState } from "@/components/layout/states";
import { ResetPasswordClient } from "./reset-password-client";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingState label="Loading..." />}>
      <ResetPasswordClient />
    </Suspense>
  );
}

