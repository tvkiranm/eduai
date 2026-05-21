"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { api, getErrorMessage } from "@/lib/api";

export default function AdminMediaPage() {
  const [file, setFile] = useState<File | null>(null);
  const upload = useMutation({
    mutationFn: (f: File) => api.media.uploadImage(f),
    onSuccess: () => toast.success("Uploaded"),
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <div>
      <PageHeader title="Media" description="Upload images using the Media API." />
      <Card>
        <CardContent className="pt-6">
          <div className="max-w-lg space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file">Image file</Label>
              <Input
                id="file"
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <Button
              onClick={() => {
                if (!file) return toast.error("Please choose a file");
                upload.mutate(file);
              }}
              disabled={upload.isPending}
            >
              {upload.isPending ? "Uploading..." : "Upload"}
            </Button>

            {upload.data ? (
              <div className="eduai-glass rounded-xl p-4 text-sm">
                <div className="font-semibold">Result</div>
                <div className="mt-2 break-all text-white/70">
                  URL: {upload.data.data.url}
                </div>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
