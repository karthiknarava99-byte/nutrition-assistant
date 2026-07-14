import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#3b82f6', '#22c55e', '#a855f7'];

export default function DashboardPage() {
  const { user } = useAuth();
  const [macros, setMacros] = useState(null);
  const [todayMeals, setTodayMeals] = useState([]);
  const [weekData, setWeekData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [macroRes, mealRes, summaryRes] = await Promise.all([
          axios.get('/api/nutrition/macros'),
          axios.get('/api/meals/today'),
          axios.get('/api/nutrition/summary?days=7'),
        ]);
        setMacros(macroRes.data);
        setTodayMeals(mealRes.data.meals || []);
        const byDate = summaryRes.data.byDate || {};
        const weekArr = Object.entries(byDate).map(([date, vals]) => ({
          date: new Date(date).toLocaleDateString('en', { weekday: 'short' }),
          calories: Math.round(vals.calories),
        })).slice(-7);
        setWeekData(weekArr);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  const macroChartData = macros ? [
    { name: 'Protein', value: Math.round(macros.protein) },
    { name: 'Carbs', value: Math.round(macros.carbs) },
    { name: 'Fat', value: Math.round(macros.fat) },
  ] : [];

  const calorieGoal = macros?.calorieGoal || user?.dailyCalorieGoal || 2000;
  const calorieProgress = Math.min(100, Math.round(((macros?.calories || 0) / calorieGoal) * 100));

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1>Good {getGreeting()}, {user?.name?.split(' ')[0]}! 👋</h1>
          <p>Here's your nutrition overview for today</p>
        </div>
        <Link to="/meals" className="btn btn-primary">+ Log Meal</Link>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card green">
          <div className="stat-label">Calories Today</div>
          <div className="stat-value">{Math.round(macros?.calories || 0)}</div>
          <div className="stat-unit">of {calorieGoal} kcal goal</div>
          <div className="progress-bar" style={{ marginTop: '0.75rem' }}>
            <div className="progress-fill" style={{ width: `${calorieProgress}%`, background: calorieProgress > 100 ? '#ef4444' : 'var(--green-500)' }}></div>
          </div>
        </div>
        <div className="stat-card blue">
          <div className="stat-label">Protein</div>
          <div className="stat-value">{Math.round(macros?.protein || 0)}</div>
          <div className="stat-unit">grams</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-label">Carbs</div>
          <div className="stat-value">{Math.round(macros?.carbs || 0)}</div>
          <div className="stat-unit">grams</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-label">Fat</div>
          <div className="stat-value">{Math.round(macros?.fat || 0)}</div>
          <div className="stat-unit">grams</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Macro Breakdown */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Today's Macros</h3>
          {macroChartData.every(d => d.value === 0) ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>
              <div style={{ fontSize: '2.5rem' }}>🍽️</div>
              <p style={{ marginTop: '0.5rem' }}>No meals logged yet</p>
              <Link to="/meals" className="btn btn-primary" style={{ marginTop: '0.75rem', display: 'inline-flex' }}>Log your first meal</Link>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={macroChartData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                  {macroChartData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={(v) => `${v}g`} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {['Protein', 'Carbs', 'Fat'].map((m, i) => (
              <span key={m} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--gray-600)' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i], display: 'inline-block' }}></span>
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* Weekly Calories */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Weekly Calories</h3>
          {weekData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>
              <div style={{ fontSize: '2.5rem' }}>📅</div>
              <p style={{ marginTop: '0.5rem' }}>No data yet for this week</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weekData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="calories" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Today's meals */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1rem' }}>Today's Meals</h3>
          <Link to="/meals" style={{ fontSize: '0.8rem', color: 'var(--green-600)', fontWeight: 600 }}>View all →</Link>
        </div>
        {todayMeals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--gray-400)' }}>
            <p>No meals logged today. Start tracking!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {todayMeals.map(meal => (
              <div key={meal._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--gray-100)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{getMealEmoji(meal.type)}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{meal.name}</div>
                    <span className={`meal-pill ${meal.type}`}>{meal.type}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: 'var(--green-600)' }}>{meal.totalCalories} kcal</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>P:{Math.round(meal.totalProtein)}g C:{Math.round(meal.totalCarbs)}g F:{Math.round(meal.totalFat)}g</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function getMealEmoji(type) {
  const map = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎' };
  return map[type] || '🍽️';
}
