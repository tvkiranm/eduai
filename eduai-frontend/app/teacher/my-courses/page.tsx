"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState, LoadingState } from "@/components/layout/states";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, getErrorMessage } from "@/lib/api";

export default function TeacherMyCoursesPage() {
  const courses = useQuery({
    queryKey: ["teacher", "my-courses"],
    queryFn: () => api.teacher.myCourses(),
  });

  useEffect(() => {
    if (courses.isError) toast.error(getErrorMessage(courses.error));
  }, [courses.error, courses.isError]);

  if (courses.isLoading) return <LoadingState label="Loading courses..." />;
  if (courses.isError) return <EmptyState title="Failed to load courses" description="Please try again." />;

  const data = courses.data?.data ?? [];

  return (
    <div>
      <PageHeader
        title="My courses"
        description="Manage your courses."
        actions={
          <Button asChild>
            <Link href="/teacher/courses/new">Create course</Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="pt-6">
          {data.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.title}</TableCell>
                    <TableCell className="capitalize">{c.status}</TableCell>
                    <TableCell>{c.price}</TableCell>
                    <TableCell>{c.category?.name ?? "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/teacher/courses/${c.id}`}>View</Link>
                        </Button>
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/teacher/courses/${c.id}/edit`}>Edit</Link>
                        </Button>
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/teacher/courses/${c.id}/students`}>Students</Link>
                        </Button>
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/teacher/courses/${c.id}/stats`}>Stats</Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState title="No courses found" description="Create your first course." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
