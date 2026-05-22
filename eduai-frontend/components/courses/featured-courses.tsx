"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { CourseCard } from "@/components/courses/course-card";
import { EmptyState, LoadingState } from "@/components/layout/states";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

export function FeaturedCourses({ limit = 6 }: { limit?: number }) {
  const courses = useQuery({
    queryKey: ["courses", "public", { limit }],
    queryFn: () => api.courses.publicList(limit),
  });

  return (
    <section id="courses" className="border-y border-[color:var(--color-border)]">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[color:var(--color-foreground)]">
              Popular courses
            </h2>
            <p className="mt-2 text-[color:var(--color-muted-foreground)]">
              Browse a few published courses from our catalog.
            </p>
          </div>
          <Button asChild variant="outline" className="hidden sm:inline-flex">
            <Link href="/student/browse">Browse all</Link>
          </Button>
        </div>

        <div className="mt-8">
          {courses.isLoading ? (
            <LoadingState label="Loading courses..." />
          ) : courses.isError ? (
            <EmptyState title="Failed to load courses" description="Please try again later." />
          ) : (courses.data ?? []).length ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {(courses.data ?? []).map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          ) : (
            <EmptyState title="No courses yet" description="Publish a course to see it here." />
          )}
        </div>

        <div className="mt-8 sm:hidden">
          <Button asChild variant="outline" className="w-full">
            <Link href="/student/browse">Browse all courses</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
