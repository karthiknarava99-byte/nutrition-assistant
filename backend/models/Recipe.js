const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  category: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'] },
  prepTime: { type: Number }, // minutes
  cookTime: { type: Number }, // minutes
  servings: { type: Number, default: 1 },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
  ingredients: [{
    name: { type: String, required: true },
    quantity: { type: String },
    unit: { type: String }
  }],
  instructions: [{ type: String }],
  nutrition: {
    calories: { type: Number },
    protein: { type: Number },
    carbs: { type: Number },
    fat: { type: Number },
    fiber: { type: Number }
  },
  tags: [String],
  dietaryInfo: {
    isVegan: { type: Boolean, default: false },
    isVegetarian: { type: Boolean, default: false },
    isGlutenFree: { type: Boolean, default: false },
    isDairyFree: { type: Boolean, default: false },
    isKeto: { type: Boolean, default: false }
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isPublic: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Recipe', recipeSchema);
