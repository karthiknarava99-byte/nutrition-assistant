import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, Legend } from 'recharts';

export default function NutritionPage() {
  const [summary, setSummary] = useState(null);
  const [macros, setMacros] = useState(null);
  const [bmi, setBmi] = useState(null);
  const [tdee, setTdee] = useState(null);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [summaryRes, macroRes] = await Promise.all([
          axios.get(`/api/nutrition/summary?days=${days}`),
          axios.get('/api/nutrition/macros'),
        ]);
        setSummary(summaryRes.data);
        setMacros(macroRes.data);

        try { const r = await axios.get('/api/nutrition/bmi'); setBmi(r.data); } catch {}
        try { const r = await axios.get('/api/nutrition/tdee'); setTdee(r.data); } catch {}
      } catch (err) {
        console.error(err);
      } finally { setLoading(false); }
    };
    fetchAll();
  }, [days]);

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>;

  const chartData = summary ? Object.entries(summary.byDate).map(([date, vals]) => ({
    date: new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    calories: Math.round(vals.calories),
    protein: Math.round(vals.protein),
    carbs: Math.round(vals.carbs),
    fat: Math.round(vals.fat),
  })) : [];

  const radialData = macros ? [
    { name: 'Protein', value: macros.proteinPct, fill: '#3b82f6' },
    { name: 'Carbs', value: macros.carbsPct, fill: '#22c55e' },
    { name: 'Fat', value: macros.fatPct, fill: '#a855f7' },
  ] : [];

  return (
    <div>
      <div className="page-header">
        <h1>Nutrition Analytics 📊</h1>
        <p>Insights into your eating patterns and health metrics</p>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {[7, 14, 30].map(d => (
          <button key={d} className={`btn ${days === d ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '0.5rem 1rem' }} onClick={() => setDays(d)}>
            {d} Days
          </button>
        ))}
      </div>

      {/* Health metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="stat-card green">
          <div className="stat-label">Avg. Daily Calories</div>
          <div className="stat-value">{Math.round(summary?.averages?.calories || 0)}</div>
          <div className="stat-unit">kcal / day</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-label">Avg. Protein</div>
          <div className="stat-value">{Math.round(summary?.averages?.protein || 0)}g</div>
          <div className="stat-unit">per day</div>
        </div>
        {bmi && (
          <div className="stat-card orange">
            <div className="stat-label">BMI</div>
            <div className="stat-value">{bmi.bmi}</div>
            <div className="stat-unit">{bmi.category}</div>
          </div>
        )}
        {tdee && (
          <div className="stat-card purple">
            <div className="stat-label">Daily TDEE</div>
            <div className="stat-value">{tdee.tdee}</div>
            <div className="stat-unit">kcal / day</div>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Calorie Trend */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Calorie Trend</h3>
          {chartData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="calories" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Today's Macro Split */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Today's Macro Split</h3>
          {!macros || (macros.protein === 0 && macros.carbs === 0 && macros.fat === 0) ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>Log meals to see macros</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="80%" data={radialData} startAngle={90} endAngle={-270}>
                  <RadialBar minAngle={10} dataKey="value" cornerRadius={4} />
                  <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
                  <Tooltip formatter={(v) => `${v}%`} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '0.5rem' }}>
                {[
                  { label: 'Protein', val: macros.protein, pct: macros.proteinPct, color: '#3b82f6' },
                  { label: 'Carbs', val: macros.carbs, pct: macros.carbsPct, color: '#22c55e' },
                  { label: 'Fat', val: macros.fat, pct: macros.fatPct, color: '#a855f7' },
                ].map(m => (
                  <div key={m.label} style={{ textAlign: 'center', padding: '0.5rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)' }}>{m.label}</div>
                    <div style={{ fontWeight: 700, color: m.color }}>{Math.round(m.val)}g</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}>{m.pct}%</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Protein & Carb trends */}
      <div className="card">
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Macro Trends Over {days} Days</h3>
        {chartData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>No data yet. Start logging meals!</div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="protein" stroke="#3b82f6" strokeWidth={2} dot={false} name="Protein (g)" />
              <Line type="monotone" dataKey="carbs" stroke="#22c55e" strokeWidth={2} dot={false} name="Carbs (g)" />
              <Line type="monotone" dataKey="fat" stroke="#a855f7" strokeWidth={2} dot={false} name="Fat (g)" />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {!bmi && !tdee && (
        <div className="card" style={{ marginTop: '1.5rem', background: '#fff7ed', border: '1px solid #fed7aa' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontSize: '2rem' }}>💡</span>
            <div>
              <strong>Complete your profile for health metrics!</strong>
              <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Add your age, gender, height, weight, and activity level in <a href="/profile" style={{ color: 'var(--green-600)' }}>Profile Settings</a> to unlock BMI and TDEE calculations.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
