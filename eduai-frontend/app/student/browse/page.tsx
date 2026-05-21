"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState, LoadingState } from "@/components/layout/states";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api, getErrorMessage } from "@/lib/api";

export default function StudentBrowseCoursesPage() {
  const qc = useQueryClient();

  const courses = useQuery({
    queryKey: ["courses"],
    queryFn: () => api.courses.list(),
  });

  useEffect(() => {
    if (courses.isError) toast.error(getErrorMessage(courses.error));
  }, [courses.error, courses.isError]);

  const enroll = useMutation({
    mutationFn: (courseId: string) => api.enrollments.enroll(courseId),
    onSuccess: async () => {
      toast.success("Enrolled successfully");
      await qc.invalidateQueries({ queryKey: ["student", "dashboard"] });
      await qc.invalidateQueries({ queryKey: ["student", "my-courses"] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  if (courses.isLoading) return <LoadingState label="Loading courses..." />;
  if (courses.isError) return <EmptyState title="Failed to load courses" description="Please try again." />;

  const data = courses.data ?? [];

  return (
    <div>
      <PageHeader title="Browse courses" description="Explore available courses." />

      {data.length ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.map((c) => (
            <Card key={c.id} className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-base">{c.title}</CardTitle>
                <CardDescription className="line-clamp-2">{c.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-white/65">
                  Level: {c.level} • Price: {c.price}
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/courses/${c.id}`}>Details</Link>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      if (c.price > 0) {
                        toast.error("Only free course enrollment is supported here");
                        return;
                      }
                      enroll.mutate(c.id);
                    }}
                    disabled={enroll.isPending}
                  >
                    Enroll (Free)
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="No courses found" />
      )}
    </div>
  );
}
