import Sidebar from './Sidebar.jsx';

// Sidebar + main content area used by dashboard-style pages
export default function PageLayout({ role = 'student', children }) {
  return (
    <div className="layout">
      <Sidebar role={role} />
      <main className="main-content">{children}</main>
    </div>
  );
}
