const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const { protect } = require('../middleware/auth');

router.use(protect);

// GET /api/recipes
router.get('/', async (req, res) => {
  try {
    const { category, search, vegan, vegetarian, glutenFree, keto, limit = 20, page = 1 } = req.query;
    const query = { $or: [{ isPublic: true }, { createdBy: req.user._id }] };

    if (category) query.category = category;
    if (search) query.title = { $regex: search, $options: 'i' };
    if (vegan === 'true') query['dietaryInfo.isVegan'] = true;
    if (vegetarian === 'true') query['dietaryInfo.isVegetarian'] = true;
    if (glutenFree === 'true') query['dietaryInfo.isGlutenFree'] = true;
    if (keto === 'true') query['dietaryInfo.isKeto'] = true;

    const recipes = await Recipe.find(query)
      .populate('createdBy', 'name')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Recipe.countDocuments(query);
    res.json({ recipes, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/recipes
router.post('/', async (req, res) => {
  try {
    const recipe = await Recipe.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(recipe);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/recipes/:id
router.get('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate('createdBy', 'name');
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/recipes/:id
router.put('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      req.body,
      { new: true }
    );
    if (!recipe) return res.status(404).json({ message: 'Recipe not found or not authorized' });
    res.json(recipe);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/recipes/:id
router.delete('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    if (!recipe) return res.status(404).json({ message: 'Recipe not found or not authorized' });
    res.json({ message: 'Recipe deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
