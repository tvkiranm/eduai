export type UserRole = "admin" | "teacher" | "student";

export type User = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type ApiMessage<T> = {
  message: string;
  data: T;
};

export type LoginResponse = ApiMessage<{
  accessToken: string;
  user: User;
}>;

export type RegisterResponse = ApiMessage<User>;

export type Category = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CourseStatus = "draft" | "published";

export type Course = {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl?: string | null;
  price: number;
  level: string;
  status: CourseStatus;
  categoryId: string;
  teacherId: string;
  createdAt?: string;
  updatedAt?: string;
  category?: Category;
  teacher?: User;
};

export type Enrollment = {
  id: string;
  studentId: string;
  courseId: string;
  createdAt?: string;
  student?: User;
  course?: Course;
};

export type TeacherDashboardResponse = ApiMessage<{
  totalCourses: number;
  totalStudents: number;
  recentCourses: Pick<Course, "id" | "title" | "status" | "thumbnailUrl" | "createdAt">[];
}>;

export type StudentDashboardResponse = ApiMessage<{
  totalEnrolledCourses: number;
  recentCourses: Enrollment[];
}>;
