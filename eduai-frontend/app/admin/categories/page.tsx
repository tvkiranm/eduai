"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState, LoadingState } from "@/components/layout/states";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, getErrorMessage } from "@/lib/api";
import { toSlug } from "@/lib/slug";
import type { Category } from "@/lib/types";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z.string().min(2, "Slug is required"),
});
type FormValues = z.infer<typeof schema>;

export default function AdminCategoriesPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Category | null>(null);
  const slugEditedRef = useRef(false);

  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.categories.list(),
  });

  useEffect(() => {
    if (categories.isError) toast.error(getErrorMessage(categories.error));
  }, [categories.error, categories.isError]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", slug: "" },
  });

  const nameRegister = form.register("name");
  const slugRegister = form.register("slug");

  useEffect(() => {
    slugEditedRef.current = false;
  }, [editing?.id]);

  const create = useMutation({
    mutationFn: (values: FormValues) => api.categories.create(values),
    onSuccess: async () => {
      toast.success("Category created");
      form.reset();
      slugEditedRef.current = false;
      await qc.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const update = useMutation({
    mutationFn: ({ id, values }: { id: string; values: FormValues }) => api.categories.update(id, values),
    onSuccess: async () => {
      toast.success("Category updated");
      setEditing(null);
      form.reset();
      slugEditedRef.current = false;
      await qc.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.categories.remove(id),
    onSuccess: async () => {
      toast.success("Category deleted");
      await qc.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  if (categories.isLoading) return <LoadingState label="Loading categories..." />;
  if (categories.isError) return <EmptyState title="Failed to load categories" description="Please try again." />;

  const data = categories.data ?? [];

  return (
    <div>
      <PageHeader title="Categories" description="Create and manage course categories." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <div className="text-sm font-semibold">
              {editing ? "Edit category" : "Create category"}
            </div>
            <form
              className="mt-4 space-y-4"
              onSubmit={form.handleSubmit((v) => {
                if (editing) return update.mutate({ id: editing.id, values: v });
                return create.mutate(v);
              })}
            >
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  {...nameRegister}
                  onChange={(e) => {
                    nameRegister.onChange(e);
                    if (editing) return;
                    if (slugEditedRef.current && form.getValues("slug")) return;

                    const next = toSlug(e.target.value);
                    if (next) form.setValue("slug", next, { shouldValidate: true });
                  }}
                />
                {form.formState.errors.name?.message ? (
                  <p className="text-sm text-red-400">{form.formState.errors.name.message}</p>
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
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={create.isPending || update.isPending}>
                  {editing
                    ? update.isPending
                      ? "Saving..."
                      : "Save"
                    : create.isPending
                      ? "Creating..."
                      : "Create"}
                </Button>
                {editing ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditing(null);
                      form.reset();
                      slugEditedRef.current = false;
                    }}
                    disabled={update.isPending || create.isPending}
                  >
                    Cancel
                  </Button>
                ) : null}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardContent className="pt-6">
            <div className="text-sm font-semibold">All categories</div>
            <div className="mt-4">
              {data.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell>{c.slug}</TableCell>
                        <TableCell>{c.isActive ? "Active" : "Inactive"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditing(c);
                                form.reset({ name: c.name, slug: c.slug });
                                slugEditedRef.current = false;
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => remove.mutate(c.id)}
                              disabled={remove.isPending}
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <EmptyState title="No categories yet" description="Create your first category on the left." />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
