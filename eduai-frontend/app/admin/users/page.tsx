"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState, LoadingState } from "@/components/layout/states";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, getErrorMessage } from "@/lib/api";

export default function AdminUsersPage() {
  const qc = useQueryClient();

  const users = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => api.admin.users(),
  });

  useEffect(() => {
    if (users.isError) toast.error(getErrorMessage(users.error));
  }, [users.error, users.isError]);

  const toggle = useMutation({
    mutationFn: (id: string) => api.admin.toggleUserStatus(id),
    onSuccess: () => {
      toast.success("User status updated");
      void qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  if (users.isLoading) return <LoadingState label="Loading users..." />;
  if (users.isError) return <EmptyState title="Failed to load users" description="Please try again." />;

  const data = users.data?.data ?? [];

  return (
    <div>
      <PageHeader title="Users" description="All users on the platform." />

      <Card>
        <CardContent className="pt-6">
          {data.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.fullName}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell className="capitalize">{u.role}</TableCell>
                    <TableCell>{u.isActive ? "Active" : "Inactive"}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggle.mutate(u.id)}
                        disabled={toggle.isPending}
                      >
                        Toggle
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState title="No users found" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
