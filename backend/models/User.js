const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  avatar: { type: String, default: '' },
  profile: {
    age: { type: Number },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    height: { type: Number }, // cm
    weight: { type: Number }, // kg
    activityLevel: {
      type: String,
      enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
      default: 'moderate'
    },
    goal: {
      type: String,
      enum: ['lose_weight', 'maintain_weight', 'gain_weight', 'build_muscle'],
      default: 'maintain_weight'
    },
    dietaryRestrictions: [String],
    allergies: [String]
  },
  dailyCalorieGoal: { type: Number, default: 2000 },
  dailyWaterGoal: { type: Number, default: 8 }, // glasses
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
