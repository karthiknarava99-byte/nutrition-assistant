import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('profile');
  const [saving, setSaving] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    dailyCalorieGoal: user?.dailyCalorieGoal || 2000,
    dailyWaterGoal: user?.dailyWaterGoal || 8,
    profile: {
      age: user?.profile?.age || '',
      gender: user?.profile?.gender || '',
      height: user?.profile?.height || '',
      weight: user?.profile?.weight || '',
      activityLevel: user?.profile?.activityLevel || 'moderate',
      goal: user?.profile?.goal || 'maintain_weight',
      dietaryRestrictions: user?.profile?.dietaryRestrictions?.join(', ') || '',
      allergies: user?.profile?.allergies?.join(', ') || '',
    }
  });

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });

  const handleProfileSave = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...profileForm,
        profile: {
          ...profileForm.profile,
          age: Number(profileForm.profile.age) || undefined,
          height: Number(profileForm.profile.height) || undefined,
          weight: Number(profileForm.profile.weight) || undefined,
          dietaryRestrictions: profileForm.profile.dietaryRestrictions.split(',').map(s => s.trim()).filter(Boolean),
          allergies: profileForm.profile.allergies.split(',').map(s => s.trim()).filter(Boolean),
        }
      };
      const res = await axios.put('/api/profile', payload);
      updateUser(res.data);
      toast.success('Profile updated! ✅');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally { setSaving(false); }
  };

  const handlePasswordSave = async e => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) return toast.error('Passwords do not match');
    setSaving(true);
    try {
      await axios.put('/api/profile/password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password updated! 🔐');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally { setSaving(false); }
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div>
      <div className="page-header">
        <h1>Profile & Goals 👤</h1>
        <p>Manage your personal details and health targets</p>
      </div>

      {/* Profile card */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, var(--green-400), var(--teal-500))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.75rem', fontWeight: 700, fontFamily: 'Sora, sans-serif', flexShrink: 0 }}>
          {initials}
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem' }}>{user?.name}</h2>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>{user?.email}</p>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            {user?.profile?.goal && <span className="badge badge-green">{user.profile.goal.replace(/_/g, ' ')}</span>}
            {user?.profile?.activityLevel && <span className="badge badge-blue">{user.profile.activityLevel.replace(/_/g, ' ')}</span>}
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '1.5rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.5rem', fontWeight: 700, color: 'var(--green-600)' }}>{user?.dailyCalorieGoal || 2000}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>kcal goal</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.5rem', fontWeight: 700, color: 'var(--blue-500)' }}>{user?.dailyWaterGoal || 8}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>glasses water</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab-btn${tab === 'profile' ? ' active' : ''}`} onClick={() => setTab('profile')}>Personal Info</button>
        <button className={`tab-btn${tab === 'goals' ? ' active' : ''}`} onClick={() => setTab('goals')}>Health Goals</button>
        <button className={`tab-btn${tab === 'password' ? ' active' : ''}`} onClick={() => setTab('password')}>Password</button>
      </div>

      {tab === 'profile' && (
        <div className="card">
          <form onSubmit={handleProfileSave}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Age</label>
                <input type="number" value={profileForm.profile.age} onChange={e => setProfileForm({ ...profileForm, profile: { ...profileForm.profile, age: e.target.value } })} placeholder="Years" />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select value={profileForm.profile.gender} onChange={e => setProfileForm({ ...profileForm, profile: { ...profileForm.profile, gender: e.target.value } })}>
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Height (cm)</label>
                <input type="number" value={profileForm.profile.height} onChange={e => setProfileForm({ ...profileForm, profile: { ...profileForm.profile, height: e.target.value } })} placeholder="cm" />
              </div>
              <div className="form-group">
                <label className="form-label">Weight (kg)</label>
                <input type="number" value={profileForm.profile.weight} onChange={e => setProfileForm({ ...profileForm, profile: { ...profileForm.profile, weight: e.target.value } })} placeholder="kg" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Dietary Restrictions (comma-separated)</label>
              <input value={profileForm.profile.dietaryRestrictions} onChange={e => setProfileForm({ ...profileForm, profile: { ...profileForm.profile, dietaryRestrictions: e.target.value } })} placeholder="e.g., vegetarian, no pork" />
            </div>
            <div className="form-group">
              <label className="form-label">Allergies (comma-separated)</label>
              <input value={profileForm.profile.allergies} onChange={e => setProfileForm({ ...profileForm, profile: { ...profileForm.profile, allergies: e.target.value } })} placeholder="e.g., peanuts, shellfish" />
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </form>
        </div>
      )}

      {tab === 'goals' && (
        <div className="card">
          <form onSubmit={handleProfileSave}>
            <div className="form-group">
              <label className="form-label">Health Goal</label>
              <select value={profileForm.profile.goal} onChange={e => setProfileForm({ ...profileForm, profile: { ...profileForm.profile, goal: e.target.value } })}>
                <option value="lose_weight">Lose Weight</option>
                <option value="maintain_weight">Maintain Weight</option>
                <option value="gain_weight">Gain Weight</option>
                <option value="build_muscle">Build Muscle</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Activity Level</label>
              <select value={profileForm.profile.activityLevel} onChange={e => setProfileForm({ ...profileForm, profile: { ...profileForm.profile, activityLevel: e.target.value } })}>
                <option value="sedentary">Sedentary (desk job, no exercise)</option>
                <option value="light">Light (1-3 days/week)</option>
                <option value="moderate">Moderate (3-5 days/week)</option>
                <option value="active">Active (6-7 days/week)</option>
                <option value="very_active">Very Active (athlete/physical job)</option>
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Daily Calorie Goal (kcal)</label>
                <input type="number" value={profileForm.dailyCalorieGoal} onChange={e => setProfileForm({ ...profileForm, dailyCalorieGoal: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Daily Water Goal (glasses)</label>
                <input type="number" value={profileForm.dailyWaterGoal} onChange={e => setProfileForm({ ...profileForm, dailyWaterGoal: e.target.value })} />
              </div>
            </div>
            <div style={{ background: 'var(--green-50)', border: '1px solid var(--green-100)', borderRadius: 'var(--radius-sm)', padding: '1rem', marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--green-700)' }}>
              💡 Tip: Fill in your age, gender, height, and weight in Personal Info to unlock automatic BMI and TDEE calculations in the Nutrition page.
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Goals'}</button>
          </form>
        </div>
      )}

      {tab === 'password' && (
        <div className="card">
          <form onSubmit={handlePasswordSave}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input type="password" value={pwForm.currentPassword} onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} placeholder="••••••••" required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input type="password" value={pwForm.newPassword} onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} placeholder="••••••••" required minLength={6} />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input type="password" value={pwForm.confirm} onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })} placeholder="••••••••" required />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Updating...' : 'Update Password'}</button>
          </form>
        </div>
      )}
    </div>
  );
}
