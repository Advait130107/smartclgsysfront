import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages";
import LoginPage from "./pages/login";
import RegisterPage from "./pages/register";
import AdminHome from "./pages/admin";
import AdminCourses from "./pages/admin/courses";
import AdminDepartments from "./pages/admin/departments";
import AdminEnrollments from "./pages/admin/enrollments";
import AdminFaculty from "./pages/admin/faculty";
import AdminFeedback from "./pages/admin/feedback";
import AdminReports from "./pages/admin/reports";
import AdminStudents from "./pages/admin/students";
import AdminSubjects from "./pages/admin/subjects";
import AdminTimetable from "./pages/admin/timetable";
import FacultyHome from "./pages/faculty";
import FacultyAssignments from "./pages/faculty/assignments";
import FacultyAttendance from "./pages/faculty/attendance";
import FacultyMarks from "./pages/faculty/marks";
import FacultyMaterials from "./pages/faculty/materials";
import StudentHome from "./pages/student";
import StudentAssignments from "./pages/student/assignments";
import StudentAttendance from "./pages/student/attendance";
import StudentCourses from "./pages/student/courses";
import StudentFeedback from "./pages/student/feedback";
import StudentMarks from "./pages/student/marks";
import StudentMaterials from "./pages/student/materials";
import StudentSubjects from "./pages/student/subjects";
import StudentTimetable from "./pages/student/timetable";

export default function App() {
  return <BrowserRouter><Routes>
    <Route path="/" element={<HomePage />} /><Route path="/login" element={<LoginPage />} /><Route path="/register" element={<RegisterPage />} />
    <Route path="/admin" element={<AdminHome />} /><Route path="/admin/courses" element={<AdminCourses />} /><Route path="/admin/departments" element={<AdminDepartments />} /><Route path="/admin/enrollments" element={<AdminEnrollments />} /><Route path="/admin/faculty" element={<AdminFaculty />} /><Route path="/admin/feedback" element={<AdminFeedback />} /><Route path="/admin/reports" element={<AdminReports />} /><Route path="/admin/students" element={<AdminStudents />} /><Route path="/admin/subjects" element={<AdminSubjects />} /><Route path="/admin/timetable" element={<AdminTimetable />} />
    <Route path="/faculty" element={<FacultyHome />} /><Route path="/faculty/assignments" element={<FacultyAssignments />} /><Route path="/faculty/attendance" element={<FacultyAttendance />} /><Route path="/faculty/marks" element={<FacultyMarks />} /><Route path="/faculty/materials" element={<FacultyMaterials />} />
    <Route path="/student" element={<StudentHome />} /><Route path="/student/assignments" element={<StudentAssignments />} /><Route path="/student/attendance" element={<StudentAttendance />} /><Route path="/student/courses" element={<StudentCourses />} /><Route path="/student/feedback" element={<StudentFeedback />} /><Route path="/student/marks" element={<StudentMarks />} /><Route path="/student/materials" element={<StudentMaterials />} /><Route path="/student/subjects" element={<StudentSubjects />} /><Route path="/student/timetable" element={<StudentTimetable />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></BrowserRouter>;
}
