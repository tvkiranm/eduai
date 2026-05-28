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

export type ResumeAnalysis = {
  personalInfo: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
  };
  profileSummary?: string;
  currentRole?: string;
  experienceYears?: string;
  skills: string[];
  technicalSkills?: string[];
  softSkills?: string[];
  experience?: string[];
  projects?: string[];
  education?: string[];
  strengths?: string[];
  weaknesses?: string[];
  missingSkills?: string[];
  suggestedRoles?: string[];
  recommendedCourses?: string[];
  learningRoadmap?: string[];
  interviewQuestions?: string[];
  resumeScore: number;
  improvementSuggestions?: string[];
};

export type ResumeAnalyzeResponse = ApiMessage<ResumeAnalysis>;

export type LessonType = "video" | "interactive" | "quiz" | "article";

export type CourseCurriculumModule = {
  id: string;
  title: string;
  description?: string | null;
  position: number;
  lessons: {
    id: string;
    title: string;
    description?: string | null;
    lessonType: LessonType;
    position: number;
    xpReward: number;
  }[];
};

export type CourseCurriculumResponse = ApiMessage<CourseCurriculumModule[]>;

export type LessonDetail = {
  id: string;
  courseId: string;
  moduleId: string;
  moduleTitle?: string | null;
  title: string;
  description?: string | null;
  lessonType: LessonType;
  position: number;
  xpReward: number;
  videoUrl?: string | null;
  articleContent?: string | null;
  interactiveConfig?: unknown | null;
  quizConfig?: unknown | null;
};

export type LessonDetailResponse = ApiMessage<LessonDetail>;

export type Conversation = {
  id: string;
  participantIds: string[];
  lastMessage: string | null;
  lastMessageAt: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt?: string;
};
