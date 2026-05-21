"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState, LoadingState } from "@/components/layout/states";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, getErrorMessage } from "@/lib/api";

export default function TeacherDashboardPage() {
  const dashboard = useQuery({
    queryKey: ["teacher", "dashboard"],
    queryFn: () => api.teacher.dashboard(),
  });

  useEffect(() => {
    if (dashboard.isError) toast.error(getErrorMessage(dashboard.error));
  }, [dashboard.error, dashboard.isError]);

  if (dashboard.isLoading) return <LoadingState label="Loading teacher dashboard..." />;
  if (dashboard.isError) return <EmptyState title="Failed to load dashboard" description="Please try again." />;

  const data = dashboard.data?.data;
  if (!data) return <EmptyState title="No dashboard data" />;

  return (
    <div>
      <PageHeader
        title="Teacher dashboard"
        description="Your course and student overview."
        actions={
          <Button asChild>
            <Link href="/teacher/courses/new">Create course</Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white/65">Total courses</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{data.totalCourses}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white/65">Total students</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{data.totalStudents}</CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent courses</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link href="/teacher/my-courses">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {data.recentCourses.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentCourses.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.title}</TableCell>
                      <TableCell className="capitalize">{c.status}</TableCell>
                      <TableCell>{c.createdAt ? new Date(c.createdAt).toLocaleString() : "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState title="No courses yet" description="Create your first course to get started." />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
