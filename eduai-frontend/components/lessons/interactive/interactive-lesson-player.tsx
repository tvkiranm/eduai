"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Editor from "@monaco-editor/react";
import { Play, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LessonDetail } from "@/lib/types";

const testCaseSchema = z.object({
  input: z.record(z.string(), z.unknown()),
  output: z.unknown(),
});

const interactiveConfigSchema = z
  .object({
    visualType: z.string().optional(),
    concept: z
      .object({
        title: z.string().optional(),
        description: z.string().optional(),
      })
      .optional(),
    hints: z.array(z.string()).optional(),
    steps: z
      .array(
        z.object({
          title: z.string().optional(),
          action: z.string().optional(),
          index: z.number().optional(),
          payload: z.record(z.string(), z.unknown()).optional(),
        }),
      )
      .optional(),
    practice: z
      .object({
        language: z.string().optional(),
        starterCode: z.string().optional(),
        functionName: z.string().optional(),
        testCases: z.array(testCaseSchema).optional(),
      })
      .optional(),
    xp: z
      .object({
        reward: z.number().optional(),
      })
      .optional(),
  })
  .passthrough();

type InteractiveConfig = z.infer<typeof interactiveConfigSchema>;

function safeString(v: unknown) {
  return typeof v === "string" ? v : "";
}

function safeNumber(v: unknown) {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function deepEqual(a: unknown, b: unknown) {
  return JSON.stringify(a) === JSON.stringify(b);
}

type RunResult = {
  passed: number;
  total: number;
  lines: string[];
  xpAwarded: number;
};

function runTests(code: string, functionName: string, testCases: { input: Record<string, unknown>; output: unknown }[]) {
  const getFn = new Function(
    `${code}\n\nreturn (typeof ${functionName} === "function") ? ${functionName} : null;`,
  ) as () => unknown;

  const fn = getFn();
  if (typeof fn !== "function") {
    throw new Error(`Could not find function "${functionName}". Make sure it is declared in your code.`);
  }

  const lines: string[] = [];
  let passed = 0;

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    let actual: unknown;
    try {
      actual = (fn as (...args: any[]) => any)(...(Object.values(tc.input) as any[]));
    } catch (err) {
      lines.push(`❌ Test ${i + 1}: runtime error: ${err instanceof Error ? err.message : String(err)}`);
      continue;
    }

    const ok = deepEqual(actual, tc.output);
    if (ok) {
      passed++;
      lines.push(`✅ Test ${i + 1}: passed`);
    } else {
      lines.push(`❌ Test ${i + 1}: expected ${JSON.stringify(tc.output)}, got ${JSON.stringify(actual)}`);
    }
  }

  return { passed, total: testCases.length, lines };
}

function MobileTabs({
  value,
  onChange,
  items,
}: {
  value: string;
  onChange: (v: string) => void;
  items: { value: string; label: string }[];
}) {
  return (
    <div className="flex gap-2 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-2 lg:hidden">
      {items.map((it) => (
        <button
          key={it.value}
          type="button"
          onClick={() => onChange(it.value)}
          className={cn(
            "flex-1 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
            value === it.value
              ? "bg-indigo-600/10 text-indigo-700"
              : "text-[color:var(--color-muted-foreground)] hover:bg-[color:var(--color-muted)]",
          )}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

function ArrayVisualizer({
  nums,
  activeIndex,
  complement,
  mapAfter,
  answer,
}: {
  nums: number[];
  activeIndex: number | null;
  complement: number | null;
  mapAfter: Record<string, unknown> | null;
  answer: unknown;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {nums.map((n, idx) => {
          const active = activeIndex === idx;
          return (
            <motion.div
              key={`${idx}-${n}`}
              layout
              className={cn(
                "min-w-[64px] rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] px-4 py-3 text-center",
                active ? "ring-2 ring-indigo-600/40" : undefined,
              )}
              initial={false}
              animate={{ scale: active ? 1.04 : 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
            >
              <div className="text-xs text-[color:var(--color-muted-foreground)]">i = {idx}</div>
              <div className="mt-1 text-lg font-semibold text-[color:var(--color-foreground)]">{n}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-4">
          <div className="text-xs font-semibold text-[color:var(--color-muted-foreground)]">Complement</div>
          <div className="mt-2 text-2xl font-semibold text-[color:var(--color-foreground)]">
            {complement === null ? "—" : complement}
          </div>
        </div>

        <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-4">
          <div className="text-xs font-semibold text-[color:var(--color-muted-foreground)]">Answer</div>
          <div className="mt-2 text-sm text-[color:var(--color-foreground)] break-all">
            {answer ? JSON.stringify(answer) : "—"}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-4">
        <div className="text-xs font-semibold text-[color:var(--color-muted-foreground)]">Hash map (value → index)</div>
        <div className="mt-2 text-sm text-[color:var(--color-foreground)] break-all">
          {mapAfter ? JSON.stringify(mapAfter) : "—"}
        </div>
      </div>
    </div>
  );
}

export function InteractiveLessonPlayer({ lesson }: { lesson: LessonDetail }) {
  const parsed = interactiveConfigSchema.safeParse(lesson.interactiveConfig ?? {});
  const config: InteractiveConfig = parsed.success ? parsed.data : {};

  const steps = config.steps ?? [];
  const hints = config.hints ?? [];
  const practice = config.practice ?? {};
  const starterCode = practice.starterCode || "function twoSum(nums, target) {\n  // TODO\n}\n";
  const functionName = practice.functionName || "twoSum";
  const testCases = practice.testCases ?? [];
  const xpReward = Math.max(0, config.xp?.reward ?? lesson.xpReward ?? 0);

  const [tab, setTab] = useState<"notes" | "visual" | "code">("visual");
  const [stepIdx, setStepIdx] = useState(0);
  const [visited, setVisited] = useState(() => new Set<number>([0]));
  const [code, setCode] = useState(starterCode);
  const [result, setResult] = useState<RunResult | null>(null);

  const current = steps[stepIdx];
  const payload = (current?.payload ?? {}) as Record<string, unknown>;

  const nums = useMemo(() => {
    const fromPayload = payload.nums;
    return Array.isArray(fromPayload) && fromPayload.every((x) => typeof x === "number") ? (fromPayload as number[]) : [2, 7, 11, 15];
  }, [payload.nums]);

  const activeIndex = safeNumber(payload.i) ?? safeNumber(current?.index) ?? null;
  const complement = safeNumber(payload.complement);
  const mapAfter = (payload.mapAfter && typeof payload.mapAfter === "object" && !Array.isArray(payload.mapAfter))
    ? (payload.mapAfter as Record<string, unknown>)
    : null;
  const answer = payload.answer ?? null;

  const progressPct = steps.length ? Math.round(((visited.size || 1) / steps.length) * 100) : 0;
  const canPrev = stepIdx > 0;
  const canNext = stepIdx < steps.length - 1;

  const mobileItems = [
    { value: "notes", label: "Notes" },
    { value: "visual", label: "Visual" },
    { value: "code", label: "Code" },
  ] as const;

  return (
    <div className="space-y-4">
      <MobileTabs
        value={tab}
        onChange={(v) => setTab(v as any)}
        items={mobileItems as any}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className={cn("lg:col-span-3", tab !== "notes" ? "hidden lg:block" : undefined)}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notes</CardTitle>
              <CardDescription>Concepts, hints, progress.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-4">
                <div className="text-xs font-semibold text-[color:var(--color-muted-foreground)]">Concept</div>
                <div className="mt-2 font-semibold text-[color:var(--color-foreground)]">
                  {safeString(config.concept?.title) || lesson.title}
                </div>
                {safeString(config.concept?.description) ? (
                  <div className="mt-2 whitespace-pre-wrap text-sm text-[color:var(--color-muted-foreground)]">
                    {safeString(config.concept?.description)}
                  </div>
                ) : null}
              </div>

              <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-4">
                <div className="text-xs font-semibold text-[color:var(--color-muted-foreground)]">Hints</div>
                {hints.length ? (
                  <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-[color:var(--color-foreground)]">
                    {hints.map((h, idx) => (
                      <li key={`${idx}-${h}`}>{h}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="mt-2 text-sm text-[color:var(--color-muted-foreground)]">No hints provided.</div>
                )}
              </div>

              <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-[color:var(--color-muted-foreground)]">Progress</div>
                  <div className="text-xs text-[color:var(--color-muted-foreground)]">{progressPct}%</div>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-black/5">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <div className="text-[color:var(--color-muted-foreground)]">XP reward</div>
                  <div className="flex items-center gap-1 font-semibold text-[color:var(--color-foreground)]">
                    <Sparkles className="h-4 w-4 text-indigo-600" />
                    {xpReward} XP
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className={cn("lg:col-span-5", tab !== "visual" ? "hidden lg:block" : undefined)}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Visualizer</CardTitle>
              <CardDescription>Step-by-step execution.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {steps.length ? (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[color:var(--color-muted-foreground)]">
                        Step {stepIdx + 1} of {steps.length}
                      </div>
                      <div className="mt-1 truncate font-semibold text-[color:var(--color-foreground)]">
                        {current?.title || "Step"}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        aria-label="Previous step"
                        disabled={!canPrev}
                        onClick={() => {
                          const next = stepIdx - 1;
                          setStepIdx(next);
                          setVisited((s) => new Set([...Array.from(s), next]));
                        }}
                      >
                        <ChevronLeft />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        aria-label="Next step"
                        disabled={!canNext}
                        onClick={() => {
                          const next = stepIdx + 1;
                          setStepIdx(next);
                          setVisited((s) => new Set([...Array.from(s), next]));
                        }}
                      >
                        <ChevronRight />
                      </Button>
                    </div>
                  </div>

                  <ArrayVisualizer
                    nums={nums}
                    activeIndex={activeIndex}
                    complement={complement}
                    mapAfter={mapAfter}
                    answer={answer}
                  />
                </>
              ) : (
                <div className="text-sm text-[color:var(--color-muted-foreground)]">
                  No visualization steps configured for this lesson.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className={cn("lg:col-span-4", tab !== "code" ? "hidden lg:block" : undefined)}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Practice</CardTitle>
              <CardDescription>Write code, run tests, earn XP.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="overflow-hidden rounded-2xl border border-[color:var(--color-border)]">
                <Editor
                  height="340px"
                  defaultLanguage="javascript"
                  value={code}
                  onChange={(v) => setCode(v ?? "")}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                    wordWrap: "on",
                    renderLineHighlight: "line",
                  }}
                />
              </div>

              <Button
                className="w-full"
                onClick={() => {
                  try {
                    const r = runTests(code, functionName, testCases as any);
                    const allPassed = r.total > 0 && r.passed === r.total;
                    setResult({
                      passed: r.passed,
                      total: r.total,
                      lines: r.lines,
                      xpAwarded: allPassed ? xpReward : 0,
                    });
                  } catch (err) {
                    setResult({
                      passed: 0,
                      total: testCases.length,
                      lines: [`❌ ${err instanceof Error ? err.message : String(err)}`],
                      xpAwarded: 0,
                    });
                  }
                }}
              >
                <Play className="h-4 w-4" />
                Run tests
              </Button>

              <AnimatePresence>
                {result ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-[color:var(--color-foreground)]">
                        Result: {result.passed}/{result.total} passed
                      </div>
                      <div className="text-sm font-semibold text-[color:var(--color-foreground)]">
                        +{result.xpAwarded} XP
                      </div>
                    </div>
                    <div className="mt-2 space-y-1 text-xs text-[color:var(--color-muted-foreground)]">
                      {result.lines.map((line, idx) => (
                        <div key={idx} className="break-words">
                          {line}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
