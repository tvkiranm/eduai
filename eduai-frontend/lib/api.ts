import axios, { AxiosError } from "axios";
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
import { getToken } from "@/lib/storage";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:4005";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export type ApiError = {
  statusCode?: number;
  message?: string | string[];
  error?: string;
};

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiError | undefined;
    if (typeof data?.message === "string") return data.message;
    if (Array.isArray(data?.message)) return data.message.join(", ");
    if (error.response?.status === 500) return "Something went wrong. Try again.";
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong. Try again.";
}

export const api = {
  auth: {
    async login(input: { email: string; password: string }) {
      const res = await apiClient.post<LoginResponse>("/auth/login", input);
      return res.data;
    },
    async register(input: {
      fullName: string;
      email: string;
      password: string;
      role: UserRole;
    }) {
      const res = await apiClient.post<RegisterResponse>("/auth/register", input);
      return res.data;
    },
    async profile() {
      const res = await apiClient.get<ApiMessage<User>>("/auth/profile");
      return res.data;
    },
  },

  categories: {
    async list() {
      const res = await apiClient.get<Category[]>("/categories");
      return res.data;
    },
    async create(input: { name: string; slug: string }) {
      const res = await apiClient.post<Category>("/categories", input);
      return res.data;
    },
    async update(id: string, input: Partial<{ name: string; slug: string; isActive: boolean }>) {
      const res = await apiClient.patch<Category>(`/categories/${id}`, input);
      return res.data;
    },
    async remove(id: string) {
      const res = await apiClient.delete<ApiMessage<unknown> | { message: string }>(
        `/categories/${id}`,
      );
      return res.data;
    },
  },

  courses: {
    async list() {
      const res = await apiClient.get<Course[]>("/courses");
      return res.data;
    },
    async get(id: string) {
      const res = await apiClient.get<Course>(`/courses/${id}`);
      return res.data;
    },
    async create(input: {
      title: string;
      slug: string;
      description: string;
      categoryId: string;
      price: number;
      level: string;
      thumbnailUrl?: string;
      status?: "draft" | "published";
    }) {
      const res = await apiClient.post<Course>("/courses", input);
      return res.data;
    },
    async update(
      id: string,
      input: Partial<{
        title: string;
        slug: string;
        description: string;
        categoryId: string;
        price: number;
        level: string;
        thumbnailUrl?: string;
        status?: "draft" | "published";
      }>,
    ) {
      const res = await apiClient.patch<Course>(`/courses/${id}`, input);
      return res.data;
    },
    async remove(id: string) {
      const res = await apiClient.delete<{ message: string }>(`/courses/${id}`);
      return res.data;
    },
  },

  media: {
    async uploadImage(file: File) {
      const form = new FormData();
      form.append("file", file);
      const res = await apiClient.post<{
        message: string;
        data: { url: string; publicId: string; format: string; resourceType: string; size: number };
      }>("/media/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
  },

  enrollments: {
    async enroll(courseId: string) {
      const res = await apiClient.post<ApiMessage<{ course: Course }>>(
        `/enrollments/${courseId}`,
      );
      return res.data;
    },
    async myCourses() {
      const res = await apiClient.get<Enrollment[]>("/enrollments/my-courses");
      return res.data;
    },
  },

  teacher: {
    async dashboard() {
      const res = await apiClient.get<TeacherDashboardResponse>("/teacher/dashboard");
      return res.data;
    },
    async myCourses() {
      const res = await apiClient.get<ApiMessage<Course[]>>("/teacher/my-courses");
      return res.data;
    },
    async courseDetails(courseId: string) {
      const res = await apiClient.get<ApiMessage<Course>>(`/teacher/courses/${courseId}`);
      return res.data;
    },
    async courseStudents(courseId: string) {
      const res = await apiClient.get<
        ApiMessage<
          {
            enrollmentId: string;
            enrolledAt: string;
            student: Pick<User, "id" | "fullName" | "email" | "role">;
          }[]
        >
      >(`/teacher/courses/${courseId}/students`);
      return res.data;
    },
    async courseStats(courseId: string) {
      const res = await apiClient.get<
        ApiMessage<{ courseId: string; title: string; status: string; totalStudents: number }>
      >(`/teacher/courses/${courseId}/stats`);
      return res.data;
    },
  },

  student: {
    async dashboard() {
      const res = await apiClient.get<StudentDashboardResponse>("/student/dashboard");
      return res.data;
    },
    async myCourses() {
      const res = await apiClient.get<ApiMessage<Enrollment[]>>("/student/my-courses");
      return res.data;
    },
    async courseDetail(courseId: string) {
      const res = await apiClient.get<ApiMessage<{ enrollment: Enrollment; course: Course }>>(
        `/student/courses/${courseId}`,
      );
      return res.data;
    },
  },

  admin: {
    async dashboard() {
      const res = await apiClient.get<
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
      return res.data;
    },
    async users() {
      const res = await apiClient.get<ApiMessage<User[]>>("/admin/users");
      return res.data;
    },
    async teachers() {
      const res = await apiClient.get<ApiMessage<User[]>>("/admin/teachers");
      return res.data;
    },
    async students() {
      const res = await apiClient.get<ApiMessage<User[]>>("/admin/students");
      return res.data;
    },
    async courses() {
      const res = await apiClient.get<ApiMessage<Course[]>>("/admin/courses");
      return res.data;
    },
    async toggleUserStatus(id: string) {
      const res = await apiClient.patch<ApiMessage<{ id: string; isActive: boolean }>>(
        `/admin/users/${id}/toggle-status`,
      );
      return res.data;
    },
  },
} as const;

export function isApiError(error: unknown): error is AxiosError<ApiError> {
  return axios.isAxiosError(error);
}

