import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const emptyRecipe = {
  title: '', description: '', category: 'lunch', prepTime: '', cookTime: '', servings: 2,
  difficulty: 'easy', ingredients: [{ name: '', quantity: '', unit: 'g' }],
  instructions: [''], tags: '',
  nutrition: { calories: '', protein: '', carbs: '', fat: '' },
  dietaryInfo: { isVegan: false, isVegetarian: false, isGlutenFree: false, isDairyFree: false, isKeto: false }
};

export default function RecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ ...emptyRecipe });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (catFilter) params.set('category', catFilter);
      const res = await axios.get(`/api/recipes?${params}`);
      setRecipes(res.data.recipes || []);
    } catch { toast.error('Failed to load recipes'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRecipes(); }, [search, catFilter]);

  const handleIngredientChange = (i, field, val) => {
    const ings = [...form.ingredients];
    ings[i] = { ...ings[i], [field]: val };
    setForm({ ...form, ingredients: ings });
  };

  const handleInstructionChange = (i, val) => {
    const inst = [...form.instructions];
    inst[i] = val;
    setForm({ ...form, instructions: inst });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        nutrition: {
          calories: Number(form.nutrition.calories) || 0,
          protein: Number(form.nutrition.protein) || 0,
          carbs: Number(form.nutrition.carbs) || 0,
          fat: Number(form.nutrition.fat) || 0,
        },
        prepTime: Number(form.prepTime) || 0,
        cookTime: Number(form.cookTime) || 0,
      };
      await axios.post('/api/recipes', payload);
      toast.success('Recipe created! 📖');
      setShowModal(false);
      setForm({ ...emptyRecipe });
      fetchRecipes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create recipe');
    } finally { setSaving(false); }
  };

  const deleteRecipe = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this recipe?')) return;
    try {
      await axios.delete(`/api/recipes/${id}`);
      toast.success('Recipe deleted');
      fetchRecipes();
    } catch { toast.error('Cannot delete — you may not own this recipe'); }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1>Recipes 📖</h1>
          <p>Browse and create healthy recipes</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Recipe</button>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input placeholder="Search recipes..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 260 }} />
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['', 'breakfast', 'lunch', 'dinner', 'snack', 'dessert'].map(cat => (
            <button key={cat} className={`btn ${catFilter === cat ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '0.4rem 0.875rem', fontSize: '0.8rem' }} onClick={() => setCatFilter(cat)}>
              {cat || 'All'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
      ) : recipes.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem' }}>🥘</div>
          <h3 style={{ marginTop: '1rem', color: 'var(--gray-600)' }}>No recipes found</h3>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setShowModal(true)}>Create Recipe</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {recipes.map(recipe => (
            <div key={recipe._id} className="card" style={{ cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
              onClick={() => setSelected(recipe)}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <span className={`meal-pill ${recipe.category}`}>{recipe.category}</span>
                <span className={`badge ${recipe.difficulty === 'easy' ? 'badge-green' : recipe.difficulty === 'medium' ? 'badge-orange' : 'badge-blue'}`}>{recipe.difficulty}</span>
              </div>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{recipe.title}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {recipe.description || 'No description'}
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                {recipe.nutrition?.calories > 0 && <span className="macro-chip calories">🔥 {recipe.nutrition.calories} kcal</span>}
                {recipe.prepTime > 0 && <span className="macro-chip protein">⏱️ {recipe.prepTime + (recipe.cookTime || 0)} min</span>}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {recipe.dietaryInfo?.isVegan && <span className="badge badge-green">Vegan</span>}
                {recipe.dietaryInfo?.isVegetarian && <span className="badge badge-green">Veg</span>}
                {recipe.dietaryInfo?.isGlutenFree && <span className="badge badge-orange">GF</span>}
                {recipe.dietaryInfo?.isKeto && <span className="badge badge-blue">Keto</span>}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                <button className="btn btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={(e) => deleteRecipe(recipe._id, e)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recipe detail modal */}
      {selected && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="modal" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h2>{selected.title}</h2>
              <div className="modal-close" onClick={() => setSelected(null)}>✕</div>
            </div>
            <p style={{ color: 'var(--gray-600)', marginBottom: '1rem' }}>{selected.description}</p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <span className="macro-chip calories">🔥 {selected.nutrition?.calories || 0} kcal</span>
              <span className="macro-chip protein">💪 {selected.nutrition?.protein || 0}g protein</span>
              <span className="macro-chip carbs">🌾 {selected.nutrition?.carbs || 0}g carbs</span>
              <span className="macro-chip fat">🥑 {selected.nutrition?.fat || 0}g fat</span>
            </div>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--gray-500)', marginBottom: '1.25rem' }}>
              <span>⏱️ Prep: {selected.prepTime || 0}m</span>
              <span>🍳 Cook: {selected.cookTime || 0}m</span>
              <span>🍽️ Serves: {selected.servings}</span>
            </div>
            <h4 style={{ marginBottom: '0.75rem' }}>Ingredients</h4>
            <ul style={{ paddingLeft: '1.25rem', marginBottom: '1.25rem', color: 'var(--gray-700)', fontSize: '0.875rem' }}>
              {selected.ingredients.map((ing, i) => (
                <li key={i} style={{ marginBottom: '0.3rem' }}>{ing.quantity} {ing.unit} {ing.name}</li>
              ))}
            </ul>
            <h4 style={{ marginBottom: '0.75rem' }}>Instructions</h4>
            <ol style={{ paddingLeft: '1.25rem', color: 'var(--gray-700)', fontSize: '0.875rem' }}>
              {selected.instructions.map((step, i) => (
                <li key={i} style={{ marginBottom: '0.5rem' }}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* Create Recipe Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: '620px' }}>
            <div className="modal-header">
              <h2>Create Recipe</h2>
              <div className="modal-close" onClick={() => setShowModal(false)}>✕</div>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Recipe title" required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Brief description..." />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {['breakfast', 'lunch', 'dinner', 'snack', 'dessert'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Difficulty</label>
                  <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}>
                    {['easy', 'medium', 'hard'].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Prep Time (min)</label>
                  <input type="number" value={form.prepTime} onChange={e => setForm({ ...form, prepTime: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Cook Time (min)</label>
                  <input type="number" value={form.cookTime} onChange={e => setForm({ ...form, cookTime: e.target.value })} />
                </div>
              </div>

              {/* Ingredients */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Ingredients</label>
                  <button type="button" className="btn btn-outline" style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
                    onClick={() => setForm({ ...form, ingredients: [...form.ingredients, { name: '', quantity: '', unit: 'g' }] })}>
                    + Add
                  </button>
                </div>
                {form.ingredients.map((ing, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr auto', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input placeholder="Ingredient" value={ing.name} onChange={e => handleIngredientChange(i, 'name', e.target.value)} />
                    <input placeholder="Qty" value={ing.quantity} onChange={e => handleIngredientChange(i, 'quantity', e.target.value)} />
                    <select value={ing.unit} onChange={e => handleIngredientChange(i, 'unit', e.target.value)}>
                      {['g', 'ml', 'cup', 'tbsp', 'tsp', 'oz', 'piece'].map(u => <option key={u}>{u}</option>)}
                    </select>
                    {form.ingredients.length > 1 && (
                      <button type="button" style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 'var(--radius-sm)', padding: '0 0.5rem', cursor: 'pointer' }}
                        onClick={() => setForm({ ...form, ingredients: form.ingredients.filter((_, idx) => idx !== i) })}>✕</button>
                    )}
                  </div>
                ))}
              </div>

              {/* Instructions */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Instructions</label>
                  <button type="button" className="btn btn-outline" style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
                    onClick={() => setForm({ ...form, instructions: [...form.instructions, ''] })}>+ Step</button>
                </div>
                {form.instructions.map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'flex-start' }}>
                    <span style={{ paddingTop: '0.6rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-400)', minWidth: 24 }}>{i + 1}.</span>
                    <textarea value={step} onChange={e => handleInstructionChange(i, e.target.value)} rows={2} placeholder={`Step ${i + 1}...`} />
                  </div>
                ))}
              </div>

              {/* Nutrition */}
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Nutrition (per serving)</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                  {['calories', 'protein', 'carbs', 'fat'].map(n => (
                    <input key={n} type="number" placeholder={n.charAt(0).toUpperCase() + n.slice(1)} value={form.nutrition[n]}
                      onChange={e => setForm({ ...form, nutrition: { ...form.nutrition, [n]: e.target.value } })} />
                  ))}
                </div>
              </div>

              {/* Dietary */}
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Dietary Info</label>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {Object.entries({ isVegan: 'Vegan', isVegetarian: 'Vegetarian', isGlutenFree: 'Gluten-Free', isDairyFree: 'Dairy-Free', isKeto: 'Keto' }).map(([key, label]) => (
                    <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={form.dietaryInfo[key]} onChange={e => setForm({ ...form, dietaryInfo: { ...form.dietaryInfo, [key]: e.target.checked } })} style={{ width: 'auto' }} />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Tags (comma-separated)</label>
                <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="healthy, quick, protein..." />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Create Recipe'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
