import type { UserRole } from "@/lib/types";
import {
  BookOpen,
  LayoutDashboard,
  Users,
  GraduationCap,
  Layers,
  Upload,
  PlusCircle,
  Map,
  MessagesSquare,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: React.ElementType;
};

export function getNavItems(role: UserRole): NavItem[] {
  if (role === "admin") {
    return [
      { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { title: "Users", href: "/admin/users", icon: Users },
      { title: "Teachers", href: "/admin/teachers", icon: GraduationCap },
      { title: "Students", href: "/admin/students", icon: Users },
      { title: "Courses", href: "/admin/courses", icon: BookOpen },
      { title: "Categories", href: "/admin/categories", icon: Layers },
      { title: "Media", href: "/admin/media", icon: Upload },
    ];
  }

  if (role === "teacher") {
    return [
      { title: "Dashboard", href: "/teacher/dashboard", icon: LayoutDashboard },
      { title: "My Courses", href: "/teacher/my-courses", icon: BookOpen },
      { title: "Create Course", href: "/teacher/courses/new", icon: PlusCircle },
      { title: "Chat", href: "/teacher/chat", icon: MessagesSquare },
    ];
  }

  return [
    { title: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
    { title: "Resume Roadmap", href: "/student/roadmap", icon: Map },
    { title: "Browse Courses", href: "/student/browse", icon: BookOpen },
    { title: "My Courses", href: "/student/my-courses", icon: GraduationCap },
    { title: "Chat", href: "/student/chat", icon: MessagesSquare },
  ];
}
