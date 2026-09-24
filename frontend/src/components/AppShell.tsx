import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { PageLoader } from "./ui/Skeleton";

type Role = "admin" | "faculty" | "student";
type NavItem = { href: string; label: string; icon: string };

const links: Record<Role, NavItem[]> = {
  admin: [
    ["/admin", "Overview", "home"], ["/admin/faculty", "Faculty", "users"], ["/admin/students", "Students", "student"],
    ["/admin/courses", "Courses", "book"], ["/admin/departments", "Departments", "grid"], ["/admin/subjects", "Subjects", "layers"],
    ["/admin/timetable", "Timetable", "calendar"], ["/admin/enrollments", "Enrollments", "check"], ["/admin/feedback", "Feedback", "message"], ["/admin/reports", "Reports", "chart"],
  ].map(([href, label, icon]) => ({ href, label, icon })),
  faculty: [
    ["/faculty", "Overview", "home"], ["/faculty/attendance", "Attendance", "calendar"], ["/faculty/marks", "Marks", "chart"],
    ["/faculty/assignments", "Assignments", "file"], ["/faculty/materials", "Materials", "folder"],
  ].map(([href, label, icon]) => ({ href, label, icon })),
  student: [
    ["/student", "Overview", "home"], ["/student/courses", "Courses", "book"], ["/student/subjects", "Subjects", "grid"], ["/student/attendance", "Attendance", "calendar"],
    ["/student/marks", "Marks", "chart"], ["/student/assignments", "Assignments", "file"], ["/student/timetable", "Timetable", "clock"], ["/student/materials", "Materials", "folder"], ["/student/feedback", "Feedback", "message"],
  ].map(([href, label, icon]) => ({ href, label, icon })),
};

function Icon({ name }: { name: string }) {
  const common = { width: 21, height: 21, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const paths: Record<string, ReactNode> = {
    home: <><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9"/><path d="M9 20v-6h6v6"/></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 5.5v16"/><path d="M8 7h8"/></>,
    grid: <><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    chart: <><path d="M5 20V10M12 20V4M19 20v-7"/><path d="M3 20h18"/></>,
    file: <><path d="M6 3h8l5 5v13H6z"/><path d="M14 3v6h5M9 13h6M9 17h6"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    folder: <><path d="M3 7h7l2 2h9v10H3z"/><path d="M3 7V5h7l2 2"/></>,
    message: <><path d="M4 5h16v11H8l-4 4z"/><path d="M8 9h8M8 13h5"/></>,
    users: <><circle cx="9" cy="8" r="3"/><path d="M3 20c0-3 2.7-5 6-5s6 2 6 5"/><path d="M16 5.5a3 3 0 0 1 0 5.8M18 15c1.8.7 3 2.1 3 4"/></>,
    student: <><path d="m3 9 9-5 9 5-9 5z"/><path d="M7 11v5c2.8 2.3 7.2 2.3 10 0v-5"/><path d="M21 9v6"/></>,
    layers: <><path d="m12 3 9 5-9 5-9-5z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/></>,
    check: <><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></>,
    logout: <><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/><path d="M21 19V5a2 2 0 0 0-2-2h-5"/></>,
  };
  return <svg {...common}>{paths[name] || paths.grid}</svg>;
}

export function AppShell({ role, children }: { role: Role; children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/login"); return; }
    if (user.role !== role) navigate(`/${user.role}`);
  }, [user, loading, role, navigate]);

  if (loading || !user || user.role !== role) return <div className="page-pad"><PageLoader /></div>;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand brand-link" to={`/${role}`}>
          <span className="brand-mark"><Icon name="student" /></span>
          <span>Smart College System</span>
        </Link>
        <nav>
          {links[role].map((item) => (
            <Link key={item.href} to={item.href} className={pathname === item.href ? "nav-link active" : "nav-link"}>
              <span className="nav-icon"><Icon name={item.icon} /></span><span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <button type="button" className="logout nav-link" onClick={() => { logout(); navigate("/login"); }}>
          <span className="nav-icon"><Icon name="logout" /></span><span>Logout</span>
        </button>
      </aside>
      <main className="main">
        <header className="topbar">
          <div><strong>{user.name}</strong><span className="muted"> · {user.role}</span></div>
        </header>
        <div className="content">{children}</div>
      </main>
    </div>
  );
}
