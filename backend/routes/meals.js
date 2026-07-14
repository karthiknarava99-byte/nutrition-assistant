const express = require('express');
const router = express.Router();
const Meal = require('../models/Meal');
const { protect } = require('../middleware/auth');

// All routes protected
router.use(protect);

// GET /api/meals - Get all meals for user (with date filter)
router.get('/', async (req, res) => {
  try {
    const { date, type, limit = 20, page = 1 } = req.query;
    const query = { user: req.user._id };

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }
    if (type) query.type = type;

    const meals = await Meal.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Meal.countDocuments(query);
    res.json({ meals, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/meals/today - Today's meals with totals
router.get('/today', async (req, res) => {
  try {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(); end.setHours(23, 59, 59, 999);

    const meals = await Meal.find({
      user: req.user._id,
      date: { $gte: start, $lte: end }
    }).sort({ date: 1 });

    const totals = meals.reduce((acc, meal) => ({
      calories: acc.calories + meal.totalCalories,
      protein: acc.protein + meal.totalProtein,
      carbs: acc.carbs + meal.totalCarbs,
      fat: acc.fat + meal.totalFat,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    res.json({ meals, totals });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/meals - Log a new meal
router.post('/', async (req, res) => {
  try {
    const meal = await Meal.create({ ...req.body, user: req.user._id });
    res.status(201).json(meal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/meals/:id
router.get('/:id', async (req, res) => {
  try {
    const meal = await Meal.findOne({ _id: req.params.id, user: req.user._id });
    if (!meal) return res.status(404).json({ message: 'Meal not found' });
    res.json(meal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/meals/:id
router.put('/:id', async (req, res) => {
  try {
    const meal = await Meal.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!meal) return res.status(404).json({ message: 'Meal not found' });
    res.json(meal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/meals/:id
router.delete('/:id', async (req, res) => {
  try {
    const meal = await Meal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!meal) return res.status(404).json({ message: 'Meal not found' });
    res.json({ message: 'Meal deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
