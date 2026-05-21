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

export default function AdminCoursesPage() {
  const courses = useQuery({
    queryKey: ["admin", "courses"],
    queryFn: () => api.admin.courses(),
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
        title="Courses"
        description="All courses (Admin view)."
        actions={
          <Button asChild>
            <Link href="/admin/courses/new">Create course</Link>
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
                  <TableHead>Teacher</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.title}</TableCell>
                    <TableCell className="capitalize">{c.status}</TableCell>
                    <TableCell>{c.price}</TableCell>
                    <TableCell>{c.category?.name ?? "-"}</TableCell>
                    <TableCell>{c.teacher?.fullName ?? "-"}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/courses/${c.id}/edit`}>Edit</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState title="No courses found" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
