const express = require('express');
const router = express.Router();
const Meal = require('../models/Meal');
const { protect } = require('../middleware/auth');

router.use(protect);

// GET /api/nutrition/summary?days=7
router.get('/summary', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const meals = await Meal.find({
      user: req.user._id,
      date: { $gte: startDate }
    });

    // Group by date
    const byDate = {};
    meals.forEach(meal => {
      const dateKey = meal.date.toISOString().split('T')[0];
      if (!byDate[dateKey]) {
        byDate[dateKey] = { calories: 0, protein: 0, carbs: 0, fat: 0, meals: 0 };
      }
      byDate[dateKey].calories += meal.totalCalories;
      byDate[dateKey].protein += meal.totalProtein;
      byDate[dateKey].carbs += meal.totalCarbs;
      byDate[dateKey].fat += meal.totalFat;
      byDate[dateKey].meals += 1;
    });

    const totalDays = Object.keys(byDate).length || 1;
    const allVals = Object.values(byDate);
    const avg = {
      calories: allVals.reduce((s, d) => s + d.calories, 0) / totalDays,
      protein: allVals.reduce((s, d) => s + d.protein, 0) / totalDays,
      carbs: allVals.reduce((s, d) => s + d.carbs, 0) / totalDays,
      fat: allVals.reduce((s, d) => s + d.fat, 0) / totalDays,
    };

    res.json({ byDate, averages: avg, totalMeals: meals.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/nutrition/macros - Today's macro breakdown
router.get('/macros', async (req, res) => {
  try {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(); end.setHours(23, 59, 59, 999);

    const meals = await Meal.find({ user: req.user._id, date: { $gte: start, $lte: end } });
    const totals = meals.reduce((acc, m) => ({
      calories: acc.calories + m.totalCalories,
      protein: acc.protein + m.totalProtein,
      carbs: acc.carbs + m.totalCarbs,
      fat: acc.fat + m.totalFat,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    const total = totals.protein + totals.carbs + totals.fat || 1;
    const macros = {
      ...totals,
      proteinPct: Math.round((totals.protein / total) * 100),
      carbsPct: Math.round((totals.carbs / total) * 100),
      fatPct: Math.round((totals.fat / total) * 100),
    };

    const goal = req.user.dailyCalorieGoal || 2000;
    macros.calorieProgress = Math.round((totals.calories / goal) * 100);
    macros.calorieGoal = goal;

    res.json(macros);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/nutrition/bmi - Calculate BMI
router.get('/bmi', protect, async (req, res) => {
  const { height, weight } = req.user.profile || {};
  if (!height || !weight) return res.status(400).json({ message: 'Height and weight required in profile' });

  const heightM = height / 100;
  const bmi = (weight / (heightM * heightM)).toFixed(1);
  let category = 'Normal';
  if (bmi < 18.5) category = 'Underweight';
  else if (bmi >= 25 && bmi < 30) category = 'Overweight';
  else if (bmi >= 30) category = 'Obese';

  res.json({ bmi: parseFloat(bmi), category });
});

// GET /api/nutrition/tdee - Calculate TDEE
router.get('/tdee', protect, async (req, res) => {
  const { age, gender, height, weight, activityLevel } = req.user.profile || {};
  if (!age || !gender || !height || !weight) {
    return res.status(400).json({ message: 'Complete profile required (age, gender, height, weight)' });
  }

  let bmr;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  const multipliers = {
    sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9
  };
  const tdee = Math.round(bmr * (multipliers[activityLevel] || 1.55));
  res.json({ bmr: Math.round(bmr), tdee, activityLevel });
});

module.exports = router;
