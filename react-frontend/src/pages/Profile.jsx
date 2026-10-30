import { useState } from 'react';
import * as api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import useAsync from '../hooks/useAsync.js';
import { Async } from '../components/Async.jsx';
import PageLayout from '../components/PageLayout.jsx';
import { Banner, FormField } from '../components/FormField.jsx';
import { errMsg, formatDate, initials } from '../utils/ui.js';

function ProfileForm({ profile }) {
  const { role, refreshUser, user } = useAuth();
  const { showToast } = useData();
  const [name, setName] = useState(profile.name);
  const [rollNo, setRollNo] = useState(profile.rollNo || '');
  const [error, setError] = useState('');
  const [banner, setBanner] = useState({ type: 'ok', message: '' });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (name.trim().length < 2) { setError('Enter your full name.'); return; }
    setError(''); setBusy(true);
    try {
      const u = await api.updateProfile({ name: name.trim(), ...(role === 'student' && rollNo.trim() ? { rollNo: rollNo.trim() } : {}) });
      refreshUser({ ...user, name: u.name, rollNo: u.rollNo });
      setBanner({ type: 'ok', message: 'Profile updated.' });
      showToast('✅ Profile updated');
    } catch (err) {
      setBanner({ type: 'bad', message: errMsg(err) });
    } finally { setBusy(false); }
  };

  return (
    <div className="card" style={{ maxWidth: 560 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
        <div className="avatar" style={{ width: 56, height: 56, fontSize: 20 }}>{initials(profile.name)}</div>
        <div><h3 style={{ fontSize: 18 }}>{profile.name}</h3><span className="pill pill-primary">{profile.role}</span></div>
      </div>
      <Banner type={banner.type} message={banner.message} />
      <form onSubmit={submit} noValidate>
        <FormField label="Full Name" htmlFor="pname" error={error}><input id="pname" value={name} onChange={(e) => setName(e.target.value)} /></FormField>
        <FormField label="Email" htmlFor="pemail" hint="Email cannot be changed here."><input id="pemail" value={profile.email} disabled /></FormField>
        {role === 'student' && <FormField label="Roll Number" htmlFor="proll"><input id="proll" value={rollNo} onChange={(e) => setRollNo(e.target.value)} /></FormField>}
        {profile.adminId && <FormField label="Admin ID" htmlFor="padm"><input id="padm" value={profile.adminId} disabled /></FormField>}
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Member since {formatDate(profile.createdAt)}</p>
        <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save Changes'}</button>
      </form>
    </div>
  );
}

export default function Profile() {
  const { role } = useAuth();
  const state = useAsync(() => api.getProfile(), []);
  return (
    <PageLayout role={role}>
      <h1 style={{ fontSize: 22, marginBottom: 22 }}>My Profile</h1>
      <Async state={state} loadingText="Loading profile…">{(p) => <ProfileForm profile={p} />}</Async>
    </PageLayout>
  );
}
