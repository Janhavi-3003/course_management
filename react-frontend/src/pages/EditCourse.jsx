import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import * as api from '../services/api.js';
import { useData } from '../context/DataContext.jsx';
import useAsync from '../hooks/useAsync.js';
import { Async } from '../components/Async.jsx';
import PageLayout from '../components/PageLayout.jsx';
import CourseForm from '../components/CourseForm.jsx';
import { Banner } from '../components/FormField.jsx';
import { errMsg } from '../utils/ui.js';

export default function EditCourse() {
  const { id } = useParams();
  const nav = useNavigate();
  const { loadCourses, showToast } = useData();
  const state = useAsync(() => api.getCourse(id), [id]);
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState({ type: 'ok', message: '' });

  const save = async (data) => {
    setBusy(true); setBanner({ type: 'ok', message: '' });
    try {
      await api.updateCourse(id, data);
      await loadCourses();
      setBanner({ type: 'ok', message: '✅ Changes saved!' });
      showToast('✅ Changes saved');
    } catch (e) {
      setBanner({ type: 'bad', message: errMsg(e) });
    } finally { setBusy(false); }
  };

  const remove = async () => {
    if (!window.confirm('Delete this course permanently? Student enrollments are removed too.')) return;
    try {
      await api.deleteCourse(id);
      await loadCourses();
      showToast('Course deleted');
      nav('/admin-dashboard');
    } catch (e) { setBanner({ type: 'bad', message: errMsg(e) }); }
  };

  return (
    <PageLayout role="admin">
      <div style={{ maxWidth: 720 }}>
        <div className="section-head">
          <h1 style={{ fontSize: 22 }}>Edit Course</h1>
          <div className="row-actions"><Link to="/admin-dashboard" className="back-link" style={{ alignSelf: 'center' }}>← Dashboard</Link>
            <button className="btn btn-danger btn-sm" onClick={remove}>Delete Course</button></div>
        </div>
        <Async state={state} loadingText="Loading course…">
          {(course) => (
            <div className="card">
              <Banner type={banner.type} message={banner.message} />
              <CourseForm initial={course} onSubmit={save} submitLabel="Save Changes" busy={busy} />
            </div>
          )}
        </Async>
      </div>
    </PageLayout>
  );
}
