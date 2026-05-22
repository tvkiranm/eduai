"use client";

import { useEffect, useRef } from "react";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api, getErrorMessage } from "@/lib/api";
import { toSlug } from "@/lib/slug";
import type { Course } from "@/lib/types";

const schema = z.object({
  title: z.string().min(2, "Title is required"),
  slug: z.string().min(2, "Slug is required"),
  description: z.string().min(10, "Description is required"),
  categoryId: z.string().min(1, "Category is required"),
  price: z.number().min(0),
  level: z.string().min(1, "Level is required"),
  status: z.enum(["draft", "published"]).optional(),
  thumbnailUrl: z.string().url().optional(),
});

export type CourseFormValues = z.infer<typeof schema>;

export function CourseForm({
  mode,
  initial,
  onSubmit,
  showAdminNote,
}: {
  mode: "create" | "edit";
  initial?: Partial<Course>;
  onSubmit: (values: CourseFormValues) => Promise<void>;
  showAdminNote?: boolean;
}) {
  const slugEditedRef = useRef(false);

  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.categories.list(),
  });

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initial?.title ?? "",
      slug: initial?.slug ?? "",
      description: initial?.description ?? "",
      categoryId: initial?.categoryId ?? "",
      price: initial?.price ?? 0,
      level: initial?.level ?? "beginner",
      status: initial?.status ?? "draft",
      thumbnailUrl: initial?.thumbnailUrl ?? undefined,
    },
  });

  const titleRegister = form.register("title");
  const slugRegister = form.register("slug");

  useEffect(() => {
    if (initial) {
      form.reset({
        title: initial.title ?? "",
        slug: initial.slug ?? "",
        description: initial.description ?? "",
        categoryId: initial.categoryId ?? "",
        price: initial.price ?? 0,
        level: initial.level ?? "beginner",
        status: (initial.status as "draft" | "published" | undefined) ?? "draft",
        thumbnailUrl: initial.thumbnailUrl ?? undefined,
      });
    }
  }, [initial, form]);

  const upload = useMutation({
    mutationFn: (file: File) => api.media.uploadImage(file),
    onSuccess: (res) => {
      form.setValue("thumbnailUrl", res.data.url, { shouldValidate: true });
      toast.success("Thumbnail uploaded");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const thumbnailUrl = useWatch({ control: form.control, name: "thumbnailUrl" });
  const categoryId = useWatch({ control: form.control, name: "categoryId" });
  const status = useWatch({ control: form.control, name: "status" });

  useEffect(() => {
    slugEditedRef.current = false;
  }, [mode, initial?.id]);

  async function handleSubmit(values: CourseFormValues) {
    try {
      await onSubmit(values);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  return (
      <Card>
      <CardContent className="pt-6">
        {showAdminNote ? (
          <div className="eduai-glass mb-4 rounded-xl border-dashed p-3 text-sm text-[color:var(--color-muted-foreground)]">
            Note: The current backend assigns the teacher automatically from the logged-in user.
          </div>
        ) : null}

        <form className="grid grid-cols-1 gap-6 md:grid-cols-2" onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...titleRegister}
              onChange={(e) => {
                titleRegister.onChange(e);
                if (mode !== "create") return;
                if (slugEditedRef.current && form.getValues("slug")) return;

                const next = toSlug(e.target.value);
                if (next) form.setValue("slug", next, { shouldValidate: true });
              }}
            />
            {form.formState.errors.title?.message ? (
              <p className="text-sm text-red-400">{form.formState.errors.title.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              {...slugRegister}
              onChange={(e) => {
                slugEditedRef.current = true;
                slugRegister.onChange(e);
              }}
            />
            {form.formState.errors.slug?.message ? (
              <p className="text-sm text-red-400">{form.formState.errors.slug.message}</p>
            ) : null}
            <p className="text-xs text-[color:var(--color-muted-foreground)]">
              Must be unique. Example: <code className="font-mono">react-js-master-course</code>
            </p>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={categoryId}
              onValueChange={(v) => form.setValue("categoryId", v, { shouldValidate: true })}
              disabled={categories.isLoading || categories.isError}
            >
              <SelectTrigger>
                <SelectValue placeholder={categories.isLoading ? "Loading..." : "Select category"} />
              </SelectTrigger>
              <SelectContent>
                {categories.data?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.categoryId?.message ? (
              <p className="text-sm text-red-400">{form.formState.errors.categoryId.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              min={0}
              step={1}
              {...form.register("price", { valueAsNumber: true })}
            />
            {form.formState.errors.price?.message ? (
              <p className="text-sm text-red-400">{form.formState.errors.price.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">Level</Label>
            <Input id="level" placeholder="beginner / intermediate / advanced" {...form.register("level")} />
            {form.formState.errors.level?.message ? (
              <p className="text-sm text-red-400">{form.formState.errors.level.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={status ?? "draft"}
              onValueChange={(v) => form.setValue("status", v as "draft" | "published")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...form.register("description")} />
            {form.formState.errors.description?.message ? (
              <p className="text-sm text-red-400">{form.formState.errors.description.message}</p>
            ) : null}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="thumbnail">Thumbnail</Label>
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <Input
                id="thumbnail"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) upload.mutate(f);
                }}
              />
              <Input
                placeholder="or paste image URL"
                value={thumbnailUrl ?? ""}
                onChange={(e) => form.setValue("thumbnailUrl", e.target.value || undefined)}
              />
            </div>
            {upload.isPending ? (
              <p className="text-sm text-[color:var(--color-muted-foreground)]">Uploading thumbnail...</p>
            ) : null}
            {thumbnailUrl ? (
              <p className="text-xs text-[color:var(--color-muted-foreground)] break-all">Saved: {thumbnailUrl}</p>
            ) : null}
          </div>

          <div className="md:col-span-2 flex gap-2">
            <Button type="submit" disabled={form.formState.isSubmitting || upload.isPending}>
              {mode === "create"
                ? form.formState.isSubmitting
                  ? "Creating..."
                  : "Create course"
                : form.formState.isSubmitting
                  ? "Saving..."
                  : "Save changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
