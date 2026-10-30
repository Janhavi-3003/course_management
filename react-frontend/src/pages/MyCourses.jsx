import { useState } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../services/api.js';
import { useData } from '../context/DataContext.jsx';
import useAsync from '../hooks/useAsync.js';
import { Async, Empty } from '../components/Async.jsx';
import PageLayout from '../components/PageLayout.jsx';
import CourseCard from '../components/CourseCard.jsx';

export default function MyCourses() {
  const { courses } = useData();
  const state = useAsync(() => api.getEnrollments(), []);
  const [filter, setFilter] = useState('all');
  const byId = new Map(courses.map((c) => [String(c.id), c]));

  return (
    <PageLayout role="student">
      <div className="section-head"><h1 style={{ fontSize: 22 }}>My Courses</h1><Link to="/browse-courses" className="btn btn-primary btn-sm">+ Browse More</Link></div>
      <Async state={state} loadingText="Loading your courses…">
        {(list) => {
          const items = list.map((e) => ({ e, c: byId.get(String(e.courseId)) })).filter((x) => x.c);
          const done = items.filter((x) => x.e.progress >= 100);
          const going = items.filter((x) => x.e.progress < 100);
          const shown = filter === 'all' ? items : filter === 'done' ? done : going;
          const chip = (key, label, cls) => (
            <span className={`pill ${filter === key ? cls : ''}`} style={{ cursor: 'pointer', ...(filter === key ? {} : { background: 'var(--border)' }) }} onClick={() => setFilter(key)}>{label}</span>
          );
          return (
            <>
              <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
                {chip('all', `All (${items.length})`, 'pill-primary')}
                {chip('going', `In Progress (${going.length})`, 'pill-primary')}
                {chip('done', `Completed (${done.length})`, 'pill-success')}
              </div>
              {shown.length === 0 ? (
                <Empty icon="📖" title="Nothing here yet">Enroll in a course to see it here.</Empty>
              ) : (
                <div className="courses-grid">
                  {shown.map(({ e, c }) => (
                    <CourseCard key={e.id} course={c} enrollment={e}>
                      {e.progress >= 100
                        ? <Link to={`/certificate/${c.id}`} className="btn btn-ghost btn-sm">Certificate</Link>
                        : <Link to={`/course/${c.id}`} className="btn btn-primary btn-sm">{e.progress > 0 ? 'Resume' : 'Start'}</Link>}
                    </CourseCard>
                  ))}
                </div>
              )}
            </>
          );
        }}
      </Async>
    </PageLayout>
  );
}
