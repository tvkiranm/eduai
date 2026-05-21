"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState, LoadingState } from "@/components/layout/states";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, getErrorMessage } from "@/lib/api";

export default function AdminDashboardPage() {
  const dashboard = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: () => api.admin.dashboard(),
  });

  if (dashboard.isLoading) return <LoadingState label="Loading admin dashboard..." />;
  if (dashboard.isError) {
    toast.error(getErrorMessage(dashboard.error));
    return <EmptyState title="Failed to load dashboard" description="Please try again." />;
  }

  const data = dashboard.data?.data;
  if (!data) return <EmptyState title="No dashboard data" />;

  return (
    <div>
      <PageHeader title="Admin dashboard" description="Overview of platform activity." />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        {[
          { label: "Users", value: data.totalUsers },
          { label: "Teachers", value: data.totalTeachers },
          { label: "Students", value: data.totalStudents },
          { label: "Courses", value: data.totalCourses },
          { label: "Enrollments", value: data.totalEnrollments },
        ].map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-white/65">{s.label}</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">{s.value}</CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent users</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/users">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {data.recentUsers.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.fullName}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell className="capitalize">{u.role}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState title="No users yet" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent courses</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/courses">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {data.recentCourses.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentCourses.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.title}</TableCell>
                      <TableCell className="capitalize">{c.status}</TableCell>
                      <TableCell>{c.price}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState title="No courses yet" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
