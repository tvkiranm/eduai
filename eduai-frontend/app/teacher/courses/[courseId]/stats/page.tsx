"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState, LoadingState } from "@/components/layout/states";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api, getErrorMessage } from "@/lib/api";

export default function TeacherCourseStatsPage() {
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId;

  const stats = useQuery({
    queryKey: ["teacher", "course", courseId, "stats"],
    queryFn: () => api.teacher.courseStats(courseId),
  });

  useEffect(() => {
    if (stats.isError) toast.error(getErrorMessage(stats.error));
  }, [stats.error, stats.isError]);

  if (stats.isLoading) return <LoadingState label="Loading stats..." />;
  if (stats.isError) return <EmptyState title="Failed to load stats" description="Please try again." />;

  const data = stats.data?.data;
  if (!data) return <EmptyState title="No stats data" />;

  return (
    <div>
      <PageHeader title="Course stats" description="Enrollment and course performance summary." />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">{data.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-white/65">
            <div>
              <span className="font-medium text-zinc-50">Course ID:</span> {data.courseId}
            </div>
            <div>
              <span className="font-medium text-zinc-50">Status:</span>{" "}
              <span className="capitalize">{data.status}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white/65">Total students</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{data.totalStudents}</CardContent>
        </Card>
      </div>
    </div>
  );
}
