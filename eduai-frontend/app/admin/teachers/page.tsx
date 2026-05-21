"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState, LoadingState } from "@/components/layout/states";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, getErrorMessage } from "@/lib/api";

export default function AdminTeachersPage() {
  const teachers = useQuery({
    queryKey: ["admin", "teachers"],
    queryFn: () => api.admin.teachers(),
  });

  useEffect(() => {
    if (teachers.isError) toast.error(getErrorMessage(teachers.error));
  }, [teachers.error, teachers.isError]);

  if (teachers.isLoading) return <LoadingState label="Loading teachers..." />;
  if (teachers.isError) return <EmptyState title="Failed to load teachers" description="Please try again." />;

  const data = teachers.data?.data ?? [];

  return (
    <div>
      <PageHeader title="Teachers" description="All teacher accounts." />
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
            <EmptyState title="No teachers found" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
