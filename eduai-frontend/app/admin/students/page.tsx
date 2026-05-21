"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState, LoadingState } from "@/components/layout/states";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, getErrorMessage } from "@/lib/api";

export default function AdminStudentsPage() {
  const students = useQuery({
    queryKey: ["admin", "students"],
    queryFn: () => api.admin.students(),
  });

  useEffect(() => {
    if (students.isError) toast.error(getErrorMessage(students.error));
  }, [students.error, students.isError]);

  if (students.isLoading) return <LoadingState label="Loading students..." />;
  if (students.isError) return <EmptyState title="Failed to load students" description="Please try again." />;

  const data = students.data?.data ?? [];

  return (
    <div>
      <PageHeader title="Students" description="All student accounts." />
      <Card>
        <CardContent className="pt-6">
          {data.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.fullName}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.isActive ? "Active" : "Inactive"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState title="No students found" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
