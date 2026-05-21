"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState, LoadingState } from "@/components/layout/states";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, getErrorMessage } from "@/lib/api";

export default function TeacherCourseStudentsPage() {
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId;

  const students = useQuery({
    queryKey: ["teacher", "course", courseId, "students"],
    queryFn: () => api.teacher.courseStudents(courseId),
  });

  useEffect(() => {
    if (students.isError) toast.error(getErrorMessage(students.error));
  }, [students.error, students.isError]);

  if (students.isLoading) return <LoadingState label="Loading enrolled students..." />;
  if (students.isError) return <EmptyState title="Failed to load students" description="Please try again." />;

  const data = students.data?.data ?? [];

  return (
    <div>
      <PageHeader title="Course students" description="Students enrolled in this course." />
      <Card>
        <CardContent className="pt-6">
          {data.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Enrolled at</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((e) => (
                  <TableRow key={e.enrollmentId}>
                    <TableCell className="font-medium">{e.student.fullName}</TableCell>
                    <TableCell>{e.student.email}</TableCell>
                    <TableCell className="capitalize">{e.student.role}</TableCell>
                    <TableCell>{new Date(e.enrolledAt).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState title="No students yet" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
