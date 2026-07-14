const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

router.use(protect);

// GET /api/profile
router.get('/', async (req, res) => {
  res.json(req.user);
});

// PUT /api/profile
router.put('/', async (req, res) => {
  try {
    const { name, avatar, profile, dailyCalorieGoal, dailyWaterGoal } = req.body;
    const update = {};
    if (name) update.name = name;
    if (avatar) update.avatar = avatar;
    if (profile) update.profile = { ...req.user.profile, ...profile };
    if (dailyCalorieGoal) update.dailyCalorieGoal = dailyCalorieGoal;
    if (dailyWaterGoal) update.dailyWaterGoal = dailyWaterGoal;

    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/profile/password
router.put('/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ message: 'Current password incorrect' });

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
