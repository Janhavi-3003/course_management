import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as api from '../services/api.js';
import { useData } from '../context/DataContext.jsx';
import PageLayout from '../components/PageLayout.jsx';
import CourseForm from '../components/CourseForm.jsx';
import { Banner } from '../components/FormField.jsx';
import { errMsg } from '../utils/ui.js';

export default function AddCourse() {
  const nav = useNavigate();
  const { loadCourses, showToast } = useData();
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState('');

  const submit = async (data) => {
    setBusy(true); setBanner('');
    try {
      await api.addCourse(data);
      await loadCourses();
      showToast('✅ Course created');
      nav('/admin-dashboard');
    } catch (e) {
      setBanner(errMsg(e));
      setBusy(false);
    }
  };

  return (
    <PageLayout role="admin">
      <div style={{ maxWidth: 720 }}>
        <div className="section-head"><h1 style={{ fontSize: 22 }}>Add New Course</h1><Link to="/admin-dashboard" className="back-link">← Dashboard</Link></div>
        <div className="card">
          <Banner type="bad" message={banner} />
          <CourseForm onSubmit={submit} submitLabel="Create Course" busy={busy} />
        </div>
      </div>
    </PageLayout>
  );
}
