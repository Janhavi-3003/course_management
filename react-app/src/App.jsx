import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RequireStudent, RequireAdmin } from './components/RouteGuards';

import Home from './pages/Home';
import Role from './pages/Role';
import StudentLogin from './pages/StudentLogin';
import StudentRegister from './pages/StudentRegister';
import AdminLogin from './pages/AdminLogin';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import BrowseCourses from './pages/BrowseCourses';
import CourseDetails from './pages/CourseDetails';
import AddCourse from './pages/AddCourse';
import EditCourse from './pages/EditCourse';
import MyCourses from './pages/MyCourses';
import ProgressPage from './pages/Progress';
import Certificate from './pages/Certificate';
import Notifications from './pages/Notifications';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/role" element={<Role />} />
          <Route path="/student-login" element={<StudentLogin />} />
          <Route path="/student-register" element={<StudentRegister />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Public: anyone (guest, student, admin) can browse the catalog */}
          <Route path="/browse-courses" element={<BrowseCourses />} />
          <Route path="/courses" element={<BrowseCourses />} />
          <Route path="/course/:id" element={<CourseDetails />} />

          {/* Student-only */}
          <Route path="/dashboard" element={<RequireStudent><StudentDashboard /></RequireStudent>} />
          <Route path="/student-dashboard" element={<RequireStudent><StudentDashboard /></RequireStudent>} />
          <Route path="/my-courses" element={<RequireStudent><MyCourses /></RequireStudent>} />
          <Route path="/progress" element={<RequireStudent><ProgressPage /></RequireStudent>} />
          <Route path="/certificate/:courseId" element={<RequireStudent><Certificate /></RequireStudent>} />
          <Route path="/notifications" element={<RequireStudent><Notifications /></RequireStudent>} />

          {/* Admin-only */}
          <Route path="/admin-dashboard" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
          <Route path="/add-course" element={<RequireAdmin><AddCourse /></RequireAdmin>} />
          <Route path="/edit-course/:id" element={<RequireAdmin><EditCourse /></RequireAdmin>} />

          <Route path="*" element={<Home />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
