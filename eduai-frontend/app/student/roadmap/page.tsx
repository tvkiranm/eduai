"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";

import { EmptyState } from "@/components/layout/states";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api, getErrorMessage } from "@/lib/api";
import type { ResumeAnalysis } from "@/lib/types";

const resumeAnalysisSchema = z
  .object({
    personalInfo: z
      .object({
        name: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        location: z.string().optional(),
      })
      .default({}),
    profileSummary: z.string().optional(),
    currentRole: z.string().optional(),
    experienceYears: z.string().optional(),
    skills: z.array(z.string()).default([]),
    technicalSkills: z.array(z.string()).optional().default([]),
    softSkills: z.array(z.string()).optional().default([]),
    experience: z.array(z.string()).optional().default([]),
    projects: z.array(z.string()).optional().default([]),
    education: z.array(z.string()).optional().default([]),
    strengths: z.array(z.string()).optional().default([]),
    weaknesses: z.array(z.string()).optional().default([]),
    missingSkills: z.array(z.string()).optional().default([]),
    suggestedRoles: z.array(z.string()).optional().default([]),
    recommendedCourses: z.array(z.string()).optional().default([]),
    learningRoadmap: z.array(z.string()).optional().default([]),
    interviewQuestions: z.array(z.string()).optional().default([]),
    resumeScore: z.number().finite().default(0),
    improvementSuggestions: z.array(z.string()).optional().default([]),
  })
  .passthrough();

const resumeAnalyzeResponseSchema = z
  .object({
    message: z.string().optional(),
    data: resumeAnalysisSchema,
  })
  .passthrough();

function compactList(items: string[] | undefined) {
  return (items ?? []).map((s) => s.trim()).filter(Boolean);
}

function FieldValue({ value }: { value?: string }) {
  const v = value?.trim();
  if (!v) return <span className="text-[color:var(--color-muted-foreground)]">—</span>;
  return <span className="break-words">{v}</span>;
}

function StringList({ items, emptyLabel }: { items?: string[]; emptyLabel: string }) {
  const list = compactList(items);
  if (!list.length) {
    return <div className="text-sm text-[color:var(--color-muted-foreground)]">{emptyLabel}</div>;
  }
  return (
    <ul className="list-inside list-disc space-y-1 text-sm text-[color:var(--color-foreground)]">
      {list.map((item, idx) => (
        <li key={`${idx}-${item}`}>{item}</li>
      ))}
    </ul>
  );
}

export default function StudentRoadmapPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);

  const upload = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Please choose a resume file.");
      return api.resume.analyze({ file, jobDescription });
    },
    onSuccess: (res) => {
      const parsed = resumeAnalyzeResponseSchema.safeParse(res);
      if (!parsed.success) {
        toast.error("Unexpected API response. Please try again.");
        return;
      }
      setAnalysis(parsed.data.data as ResumeAnalysis);
      toast.success(parsed.data.message ?? "Resume analyzed successfully");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const score = analysis?.resumeScore ?? 0;
  const roadmap = useMemo(() => compactList(analysis?.learningRoadmap), [analysis?.learningRoadmap]);
  const courses = useMemo(
    () => compactList(analysis?.recommendedCourses),
    [analysis?.recommendedCourses],
  );

  useEffect(() => {
    if (!file) return;
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error("File too large. Max 5MB allowed.");
      setFile(null);
    }
  }, [file]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Upload Resume</CardTitle>
          <CardDescription>Upload PDF or DOCX to generate your learning roadmap.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resume">Resume (PDF/DOCX)</Label>
            <Input
              id="resume"
              type="file"
              accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.pdf,.docx"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {file ? (
              <div className="text-xs text-[color:var(--color-muted-foreground)] break-all">
                Selected: {file.name}
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="jd">Job Description (optional)</Label>
            <Textarea
              id="jd"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste a job description to tailor missing skills, recommended courses, and roadmap..."
              className="min-h-28"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => upload.mutate()}
              disabled={!file || upload.isPending}
            >
              {upload.isPending ? "Analyzing..." : "Generate Roadmap"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setFile(null);
                setJobDescription("");
                setAnalysis(null);
              }}
              disabled={upload.isPending}
            >
              Reset
            </Button>
          </div>

          {analysis ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-4">
                <div className="text-xs font-semibold text-[color:var(--color-muted-foreground)]">
                  Resume score
                </div>
                <div className="mt-2 text-3xl font-semibold">{Math.max(0, Math.min(100, score))}</div>
                <div className="mt-1 text-xs text-[color:var(--color-muted-foreground)]">out of 100</div>
              </div>

              <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-4">
                <div className="text-xs font-semibold text-[color:var(--color-muted-foreground)]">
                  Personal info
                </div>
                <div className="mt-2 space-y-1 text-sm">
                  <div>
                    <span className="text-[color:var(--color-muted-foreground)]">Name: </span>
                    <FieldValue value={analysis.personalInfo?.name} />
                  </div>
                  <div>
                    <span className="text-[color:var(--color-muted-foreground)]">Email: </span>
                    <FieldValue value={analysis.personalInfo?.email} />
                  </div>
                  <div>
                    <span className="text-[color:var(--color-muted-foreground)]">Location: </span>
                    <FieldValue value={analysis.personalInfo?.location} />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState
              title="No roadmap yet"
              description="Upload your resume to generate a personalized roadmap."
            />
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Learning Roadmap</CardTitle>
            <CardDescription>Your next best steps based on the resume analysis.</CardDescription>
          </CardHeader>
          <CardContent>
            {analysis ? (
              roadmap.length ? (
                <ol className="list-inside list-decimal space-y-2 text-sm">
                  {roadmap.map((step, idx) => (
                    <li key={`${idx}-${step}`} className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-3">
                      {step}
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="text-sm text-[color:var(--color-muted-foreground)]">
                  No roadmap items found in the response.
                </div>
              )
            ) : (
              <div className="text-sm text-[color:var(--color-muted-foreground)]">
                Upload a resume to see the roadmap here.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommended Courses</CardTitle>
            <CardDescription>Suggested learning topics/courses from the analysis.</CardDescription>
          </CardHeader>
          <CardContent>
            {analysis ? (
              <StringList items={courses} emptyLabel="No course recommendations yet." />
            ) : (
              <div className="text-sm text-[color:var(--color-muted-foreground)]">
                Upload a resume to see recommendations.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Missing Skills</CardTitle>
            <CardDescription>Skills to add based on your target role.</CardDescription>
          </CardHeader>
          <CardContent>
            {analysis ? (
              <StringList items={analysis.missingSkills} emptyLabel="No missing skills listed." />
            ) : (
              <div className="text-sm text-[color:var(--color-muted-foreground)]">
                Upload a resume to see missing skills.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

