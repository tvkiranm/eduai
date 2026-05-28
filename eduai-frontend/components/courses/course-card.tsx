"use client";

import Link from "next/link";
import Image from "next/image";
import { BookOpen, IndianRupee } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Course } from "@/lib/types";

function formatPrice(price: number) {
  if (!price) return "Free";
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return `₹${price}`;
  }
}

export function CourseCard({
  course,
  detailsHref = `/courses/${course.id}`,
  onEnroll,
  enrolling,
  showEnroll = false,
  enrolled = false,
}: {
  course: Course;
  detailsHref?: string;
  onEnroll?: (courseId: string) => void;
  enrolling?: boolean;
  showEnroll?: boolean;
  enrolled?: boolean;
}) {
  const priceLabel = formatPrice(course.price);
  const canEnroll = !enrolled && showEnroll && typeof onEnroll === "function";

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <div className="relative aspect-[16/9] w-full bg-[color:var(--color-muted)]">
        {course.thumbnailUrl ? (
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-600/10 via-violet-600/10 to-fuchsia-600/10">
            <BookOpen className="h-7 w-7 text-[color:var(--color-muted-foreground)]" />
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="capitalize">
            {course.level}
          </Badge>
          <Badge variant={course.price ? "outline" : "secondary"}>
            {course.price ? <IndianRupee className="mr-1 h-3.5 w-3.5" /> : null}
            {priceLabel}
          </Badge>
          {enrolled ? <Badge>Enrolled</Badge> : null}
        </div>
        <CardTitle className="mt-2 line-clamp-1 text-base">
          {course.title}
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {course.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="mt-auto flex items-center gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href={detailsHref}>Details</Link>
        </Button>

        {canEnroll ? (
          <Button
            size="sm"
            onClick={() => onEnroll(course.id)}
            disabled={Boolean(enrolling)}
          >
            {course.price > 0 ? "Enroll (Paid)" : "Enroll (Free)"}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
