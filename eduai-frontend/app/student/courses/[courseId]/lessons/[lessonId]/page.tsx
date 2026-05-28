"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState, LoadingState } from "@/components/layout/states";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api, getErrorMessage } from "@/lib/api";
import { InteractiveLessonPlayer } from "@/components/lessons/interactive/interactive-lesson-player";

export default function StudentLessonPage() {
  const params = useParams<{ courseId: string; lessonId: string }>();
  const courseId = params.courseId;
  const lessonId = params.lessonId;

  const lesson = useQuery({
    queryKey: ["student", "lesson", lessonId],
    queryFn: () => api.student.lessonDetail(lessonId),
  });

  useEffect(() => {
    if (lesson.isError) toast.error(getErrorMessage(lesson.error));
  }, [lesson.error, lesson.isError]);

  if (lesson.isLoading) return <LoadingState label="Loading lesson..." />;
  if (lesson.isError) return <EmptyState title="Failed to load lesson" description="Please try again." />;

  const data = lesson.data?.data;
  if (!data) return <EmptyState title="No lesson data" />;

  if (data.courseId !== courseId) {
    return <EmptyState title="Lesson mismatch" description="This lesson does not belong to this course." />;
  }

  return (
    <div>
      <PageHeader
        title={data.title}
        description={data.description ?? undefined}
        actions={
          <Button asChild variant="outline">
            <Link href={`/student/courses/${courseId}`}>Back to course</Link>
          </Button>
        }
      />

      {data.lessonType === "interactive" ? (
        <InteractiveLessonPlayer lesson={data} />
      ) : data.lessonType === "article" ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Article</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none whitespace-pre-wrap text-sm text-[color:var(--color-foreground)]">
            {data.articleContent ?? "No article content."}
          </CardContent>
        </Card>
      ) : data.lessonType === "video" ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Video</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-[color:var(--color-muted-foreground)]">
            <div>Video lessons are not wired yet in this MVP.</div>
            <div className="break-all">URL: {data.videoUrl ?? "—"}</div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quiz</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[color:var(--color-muted-foreground)]">
            Quiz lessons are not wired yet in this MVP.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

