"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState, LoadingState } from "@/components/layout/states";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, getErrorMessage } from "@/lib/api";

export default function StudentMyCoursesPage() {
  const my = useQuery({
    queryKey: ["student", "my-courses"],
    queryFn: () => api.student.myCourses(),
  });

  useEffect(() => {
    if (my.isError) toast.error(getErrorMessage(my.error));
  }, [my.error, my.isError]);

  if (my.isLoading) return <LoadingState label="Loading your courses..." />;
  if (my.isError) return <EmptyState title="Failed to load courses" description="Please try again." />;

  const data = my.data?.data ?? [];

  return (
    <div>
      <PageHeader title="My courses" description="Courses you are enrolled in." />
      <Card>
        <CardContent className="pt-6">
          {data.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Enrolled</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.course?.title ?? e.courseId}</TableCell>
                    <TableCell>{e.course?.category?.name ?? "-"}</TableCell>
                    <TableCell>{e.course?.teacher?.fullName ?? "-"}</TableCell>
                    <TableCell>{e.createdAt ? new Date(e.createdAt).toLocaleString() : "-"}</TableCell>
                    <TableCell className="text-right">
                      <Link
                        className="text-sm font-medium text-[color:var(--color-foreground)] hover:underline"
                        href={`/student/courses/${e.courseId}`}
                      >
                        Open
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              title="No enrolled courses"
              description="Browse courses and enroll in a free one."
              action={
                <Link
                  href="/student/browse"
                  className="text-sm font-medium underline text-[color:var(--color-foreground)]"
                >
                  Browse courses
                </Link>
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
