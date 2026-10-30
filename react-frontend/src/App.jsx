import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import { RequireAdmin, RequireAuth, RequireStudent } from './components/RouteGuards.jsx';

import Home from './pages/Home.jsx';
import Role from './pages/Role.jsx';
import StudentLogin from './pages/StudentLogin.jsx';
import StudentRegister from './pages/StudentRegister.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import BrowseCourses from './pages/BrowseCourses.jsx';
import CourseDetails from './pages/CourseDetails.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import MyCourses from './pages/MyCourses.jsx';
import Progress from './pages/Progress.jsx';
import Certificate from './pages/Certificate.jsx';
import Notifications from './pages/Notifications.jsx';
import Chat from './pages/Chat.jsx';
import Profile from './pages/Profile.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AddCourse from './pages/AddCourse.jsx';
import EditCourse from './pages/EditCourse.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/role" element={<Role />} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/student-register" element={<StudentRegister />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/browse-courses" element={<BrowseCourses />} />
        <Route path="/course/:id" element={<CourseDetails />} />

        <Route path="/student-dashboard" element={<RequireStudent><StudentDashboard /></RequireStudent>} />
        <Route path="/my-courses" element={<RequireStudent><MyCourses /></RequireStudent>} />
        <Route path="/progress" element={<RequireStudent><Progress /></RequireStudent>} />
        <Route path="/notifications" element={<RequireStudent><Notifications /></RequireStudent>} />
        <Route path="/certificate/:courseId" element={<RequireStudent><Certificate /></RequireStudent>} />

        <Route path="/chat" element={<RequireAuth><Chat /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />

        <Route path="/admin-dashboard" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
        <Route path="/add-course" element={<RequireAdmin><AddCourse /></RequireAdmin>} />
        <Route path="/edit-course/:id" element={<RequireAdmin><EditCourse /></RequireAdmin>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  );
}
