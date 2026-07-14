import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const emptyFood = { name: '', quantity: '', unit: 'g', calories: '', protein: '', carbs: '', fat: '' };
const emptyMeal = { name: '', type: 'breakfast', date: new Date().toISOString().split('T')[0], notes: '', foods: [{ ...emptyFood }] };

export default function MealsPage() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ ...emptyMeal });
  const [saving, setSaving] = useState(false);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);

  const fetchMeals = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/meals?date=${dateFilter}`);
      setMeals(res.data.meals || []);
    } catch { toast.error('Failed to load meals'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMeals(); }, [dateFilter]);

  const handleFoodChange = (i, field, val) => {
    const foods = [...form.foods];
    foods[i] = { ...foods[i], [field]: val };
    setForm({ ...form, foods });
  };

  const addFood = () => setForm({ ...form, foods: [...form.foods, { ...emptyFood }] });
  const removeFood = (i) => setForm({ ...form, foods: form.foods.filter((_, idx) => idx !== i) });

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        foods: form.foods.map(f => ({
          ...f,
          quantity: Number(f.quantity),
          calories: Number(f.calories),
          protein: Number(f.protein) || 0,
          carbs: Number(f.carbs) || 0,
          fat: Number(f.fat) || 0,
        }))
      };
      await axios.post('/api/meals', payload);
      toast.success('Meal logged! 🍽️');
      setShowModal(false);
      setForm({ ...emptyMeal });
      fetchMeals();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log meal');
    } finally { setSaving(false); }
  };

  const deleteMeal = async (id) => {
    if (!window.confirm('Delete this meal?')) return;
    try {
      await axios.delete(`/api/meals/${id}`);
      toast.success('Meal deleted');
      fetchMeals();
    } catch { toast.error('Failed to delete'); }
  };

  const totalCals = meals.reduce((s, m) => s + m.totalCalories, 0);

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1>Meal Log 🍽️</h1>
          <p>Track everything you eat and drink</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Log Meal</button>
      </div>

      {/* Date filter + summary */}
      <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div>
          <label className="form-label" style={{ marginBottom: '0.25rem' }}>Date</label>
          <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} style={{ width: 'auto' }} />
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <span className="macro-chip calories">🔥 {Math.round(totalCals)} kcal</span>
          <span className="macro-chip protein">💪 {Math.round(meals.reduce((s, m) => s + m.totalProtein, 0))}g protein</span>
          <span className="macro-chip carbs">🌾 {Math.round(meals.reduce((s, m) => s + m.totalCarbs, 0))}g carbs</span>
          <span className="macro-chip fat">🥑 {Math.round(meals.reduce((s, m) => s + m.totalFat, 0))}g fat</span>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
      ) : meals.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem' }}>🥗</div>
          <h3 style={{ marginTop: '1rem', color: 'var(--gray-600)' }}>No meals for this day</h3>
          <p style={{ color: 'var(--gray-400)', marginTop: '0.5rem' }}>Start by logging your first meal!</p>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setShowModal(true)}>Log Meal</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {['breakfast', 'lunch', 'dinner', 'snack'].map(type => {
            const typeMeals = meals.filter(m => m.type === type);
            if (!typeMeals.length) return null;
            return (
              <div key={type} className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{getMealEmoji(type)}</span>
                  <h3 style={{ textTransform: 'capitalize', fontSize: '1rem' }}>{type}</h3>
                  <span className="badge badge-green" style={{ marginLeft: 'auto' }}>
                    {Math.round(typeMeals.reduce((s, m) => s + m.totalCalories, 0))} kcal
                  </span>
                </div>
                {typeMeals.map(meal => (
                  <div key={meal._id} style={{ padding: '0.875rem', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-sm)', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{meal.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginTop: '0.25rem' }}>
                          {meal.foods.map(f => f.name).join(', ')}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 700, color: 'var(--green-600)', fontSize: '0.95rem' }}>{meal.totalCalories} kcal</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}>
                            P:{Math.round(meal.totalProtein)}g · C:{Math.round(meal.totalCarbs)}g · F:{Math.round(meal.totalFat)}g
                          </div>
                        </div>
                        <button className="btn btn-danger" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }} onClick={() => deleteMeal(meal._id)}>🗑️</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Log Meal Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>Log a Meal</h2>
              <div className="modal-close" onClick={() => setShowModal(false)}>✕</div>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Meal Name</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g., Oatmeal Bowl" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    {['breakfast', 'lunch', 'dinner', 'snack'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Food Items</label>
                  <button type="button" className="btn btn-outline" style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }} onClick={addFood}>+ Add Food</button>
                </div>
                {form.foods.map((food, i) => (
                  <div key={i} style={{ background: 'var(--gray-50)', padding: '0.875rem', borderRadius: 'var(--radius-sm)', marginBottom: '0.5rem', border: '1px solid var(--gray-100)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <input placeholder="Food name" value={food.name} onChange={e => handleFoodChange(i, 'name', e.target.value)} required />
                      <input type="number" placeholder="Qty" value={food.quantity} onChange={e => handleFoodChange(i, 'quantity', e.target.value)} required />
                      <select value={food.unit} onChange={e => handleFoodChange(i, 'unit', e.target.value)}>
                        {['g', 'ml', 'oz', 'cup', 'tbsp', 'tsp', 'piece'].map(u => <option key={u}>{u}</option>)}
                      </select>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                      <input type="number" placeholder="Calories" value={food.calories} onChange={e => handleFoodChange(i, 'calories', e.target.value)} required />
                      <input type="number" placeholder="Protein(g)" value={food.protein} onChange={e => handleFoodChange(i, 'protein', e.target.value)} />
                      <input type="number" placeholder="Carbs(g)" value={food.carbs} onChange={e => handleFoodChange(i, 'carbs', e.target.value)} />
                      <input type="number" placeholder="Fat(g)" value={food.fat} onChange={e => handleFoodChange(i, 'fat', e.target.value)} />
                    </div>
                    {form.foods.length > 1 && (
                      <button type="button" onClick={() => removeFood(i)} style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
                    )}
                  </div>
                ))}
              </div>

              <div className="form-group">
                <label className="form-label">Notes (optional)</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any notes about this meal..." rows={2} />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Log Meal'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function getMealEmoji(type) {
  return { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎' }[type] || '🍽️';
}
