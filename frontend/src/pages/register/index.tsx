
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { FormEvent, useEffect, useState } from "react";
import { api, Paginated } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Select } from "@/components/ui/Select";
import { TableSkeleton } from "@/components/ui/Skeleton";

type Course = {
  course_id: number;
  coursename: string;
  seats: number;
  enrolled: number;
};

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [courseId, setCourseId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api<Paginated<Course>>("/api/courses?limit=100")
      .then((res) => setCourses(res.data))
      .catch(() => setCourses([]))
      .finally(() => setLoadingCourses(false));
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await register({
        name,
        email,
        password,
        course_id: courseId ? Number(courseId) : undefined,
      });
      setSuccess("Registration successful. You can login now.");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card stack" onSubmit={onSubmit}>
        <div className="brand">College CMS</div>
        <h2>Student registration</h2>
        <p>Create an account and optionally enroll in a course.</p>
        {loadingCourses ? (
          <TableSkeleton rows={3} />
        ) : (
          <>
            <label>
              Full name
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </label>
            <label>
              Course
              <Select
                value={courseId}
                onChange={setCourseId}
                placeholder="Select later"
                searchable
                options={courses.map((c) => ({
                  value: String(c.course_id),
                  label: `${c.coursename} (${c.enrolled}/${c.seats} seats)`,
                }))}
              />
            </label>
          </>
        )}
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
        <button className="btn" disabled={loading || loadingCourses} type="submit">
          {loading ? "Submitting..." : "Register"}
        </button>
        <p>
          Already registered? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}
