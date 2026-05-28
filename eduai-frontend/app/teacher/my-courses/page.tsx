"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { BarChart3, Eye, MoreHorizontal, Pencil, Users } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState, LoadingState } from "@/components/layout/states";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
                  <TableHead className="w-[1%] whitespace-nowrap text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="max-w-[520px] truncate font-medium" title={c.title}>
                      {c.title}
                    </TableCell>
                    <TableCell className="capitalize">{c.status}</TableCell>
                    <TableCell>{c.price}</TableCell>
                    <TableCell>{c.category?.name ?? "-"}</TableCell>
                    <TableCell className="w-[1%] whitespace-nowrap text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="outline" aria-label="Course actions">
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/teacher/courses/${c.id}`} className="flex items-center gap-2">
                              <Eye className="h-4 w-4" />
                              View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/teacher/courses/${c.id}/edit`} className="flex items-center gap-2">
                              <Pencil className="h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/teacher/courses/${c.id}/students`}
                              className="flex items-center gap-2"
                            >
                              <Users className="h-4 w-4" />
                              Students
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/teacher/courses/${c.id}/stats`} className="flex items-center gap-2">
                              <BarChart3 className="h-4 w-4" />
                              Stats
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
