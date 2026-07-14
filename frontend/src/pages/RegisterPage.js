import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="icon">🥗</div>
          <h1>NutriAssist</h1>
          <p>Create your free account</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="John Doe" required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" required minLength={6} />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm</label>
              <input type="password" name="confirm" value={form.confirm} onChange={handleChange} placeholder="••••••••" required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--gray-500)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--green-600)', fontWeight: 600 }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}
