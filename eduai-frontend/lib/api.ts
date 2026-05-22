import type {
  ApiMessage,
  Category,
  Course,
  Enrollment,
  LoginResponse,
  RegisterResponse,
  StudentDashboardResponse,
  TeacherDashboardResponse,
  User,
  UserRole,
} from "@/lib/types";

export type ApiError = {
  statusCode?: number;
  message?: string | string[];
  error?: string;
};

export class ApiHttpError extends Error {
  status: number;
  data: ApiError | unknown;

  constructor(status: number, message: string, data: ApiError | unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiHttpError) {
    const data = error.data as ApiError | undefined;
    if (typeof data?.message === "string") return data.message;
    if (Array.isArray(data?.message)) return data.message.join(", ");
    if (error.status === 401) return "Unauthorized. Please sign in again.";
    if (error.status >= 500) return "Something went wrong. Try again.";
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong. Try again.";
}

const BFF_BASE = "/api/bff";

function buildUrl(path: string) {
  // In the browser, relative is correct. On the server, allow an absolute base if provided.
  const base =
    typeof window === "undefined"
      ? (process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? "").replace(/\/$/, "")
      : "";
  return `${base}${BFF_BASE}${path}`;
}

async function requestJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(buildUrl(path), {
    credentials: "include",
    cache: "no-store",
    ...init,
  });

  const contentType = res.headers.get("content-type") ?? "";
  const raw = await res.text();
  const isJson = contentType.includes("application/json");
  const parsed = isJson && raw ? (JSON.parse(raw) as unknown) : raw;

  if (!res.ok) {
    const data = parsed as ApiError | unknown;
    const message =
      typeof (data as ApiError | undefined)?.message === "string"
        ? ((data as ApiError).message as string)
        : res.statusText || "Request failed";
    throw new ApiHttpError(res.status, message, data);
  }

  return parsed as T;
}

export const api = {
  auth: {
    async login(input: { email: string; password: string }) {
      return requestJson<LoginResponse>("/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });
    },
    async register(input: {
      fullName: string;
      email: string;
      password: string;
      role: UserRole;
    }) {
      return requestJson<RegisterResponse>("/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });
    },
    async profile() {
      return requestJson<ApiMessage<User>>("/auth/profile");
    },
    async logout() {
      return requestJson<ApiMessage<null>>("/auth/logout", { method: "POST" });
    },
  },

  categories: {
    async list() {
      return requestJson<Category[]>("/categories");
    },
    async create(input: { name: string; slug: string }) {
      return requestJson<Category>("/categories", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });
    },
    async update(
      id: string,
      input: Partial<{ name: string; slug: string; isActive: boolean }>,
    ) {
      return requestJson<Category>(`/categories/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });
    },
    async remove(id: string) {
      return requestJson<ApiMessage<unknown> | { message: string }>(
        `/categories/${id}`,
        { method: "DELETE" },
      );
    },
  },

  courses: {
    async list() {
      return requestJson<Course[]>("/courses");
    },
    async publicList(limit?: number) {
      const qs =
        typeof limit === "number" ? `?limit=${encodeURIComponent(limit)}` : "";
      return requestJson<Course[]>(`/courses/public${qs}`);
    },
    async get(id: string) {
      return requestJson<Course>(`/courses/${id}`);
    },
    async create(input: {
      title: string;
      slug?: string;
      description: string;
      categoryId: string;
      price: number;
      level: string;
      thumbnailUrl?: string;
      status?: "draft" | "published";
    }) {
      return requestJson<Course>("/courses", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });
    },
    async update(
      id: string,
      input: Partial<{
        title: string;
        slug?: string;
        description: string;
        categoryId: string;
        price: number;
        level: string;
        thumbnailUrl?: string;
        status?: "draft" | "published";
      }>,
    ) {
      return requestJson<Course>(`/courses/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });
    },
    async remove(id: string) {
      return requestJson<{ message: string }>(`/courses/${id}`, {
        method: "DELETE",
      });
    },
  },

  media: {
    async uploadImage(file: File) {
      const form = new FormData();
      form.append("file", file);
      return requestJson<{
        message: string;
        data: {
          url: string;
          publicId: string;
          format: string;
          resourceType: string;
          size: number;
        };
      }>("/media/upload", {
        method: "POST",
        body: form,
      });
    },
  },

  enrollments: {
    async enroll(courseId: string) {
      return requestJson<ApiMessage<{ course: Course }>>(
        `/enrollments/${courseId}`,
        { method: "POST" },
      );
    },
    async myCourses() {
      return requestJson<Enrollment[]>("/enrollments/my-courses");
    },
  },

  teacher: {
    async dashboard() {
      return requestJson<TeacherDashboardResponse>("/teacher/dashboard");
    },
    async myCourses() {
      return requestJson<ApiMessage<Course[]>>("/teacher/my-courses");
    },
    async courseDetails(courseId: string) {
      return requestJson<ApiMessage<Course>>(`/teacher/courses/${courseId}`);
    },
    async courseStudents(courseId: string) {
      return requestJson<
        ApiMessage<
          {
            enrollmentId: string;
            enrolledAt: string;
            student: Pick<User, "id" | "fullName" | "email" | "role">;
          }[]
        >
      >(`/teacher/courses/${courseId}/students`);
    },
    async courseStats(courseId: string) {
      return requestJson<
        ApiMessage<{
          courseId: string;
          title: string;
          status: string;
          totalStudents: number;
        }>
      >(`/teacher/courses/${courseId}/stats`);
    },
  },

  student: {
    async dashboard() {
      return requestJson<StudentDashboardResponse>("/student/dashboard");
    },
    async myCourses() {
      return requestJson<ApiMessage<Enrollment[]>>("/student/my-courses");
    },
    async courseDetail(courseId: string) {
      return requestJson<
        ApiMessage<{ enrollment: Enrollment; course: Course }>
      >(`/student/courses/${courseId}`);
    },
  },

  admin: {
    async dashboard() {
      return requestJson<
        ApiMessage<{
          totalUsers: number;
          totalTeachers: number;
          totalStudents: number;
          totalCourses: number;
          totalEnrollments: number;
          recentUsers: User[];
          recentCourses: Course[];
        }>
      >("/admin/dashboard");
    },
    async users() {
      return requestJson<ApiMessage<User[]>>("/admin/users");
    },
    async teachers() {
      return requestJson<ApiMessage<User[]>>("/admin/teachers");
    },
    async students() {
      return requestJson<ApiMessage<User[]>>("/admin/students");
    },
    async courses() {
      return requestJson<ApiMessage<Course[]>>("/admin/courses");
    },
    async toggleUserStatus(id: string) {
      return requestJson<
        ApiMessage<{ id: string; isActive: boolean }>
      >(`/admin/users/${id}/toggle-status`, { method: "PATCH" });
    },
  },
} as const;
