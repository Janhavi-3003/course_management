const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema(
  {
    moduleId: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    icon: { type: String, default: "📘" },
    lessons: { type: Number, default: 1, min: 1 },
    videoMinutes: { type: Number, default: 10, min: 1 },
    theory: [{ type: String }]
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    // duration is measured in HOURS
    duration: { type: Number, required: true, min: 1 },
    category: {
      type: String,
      enum: ["Web Development", "Data Science", "Design", "Cloud", "Mobile", "Database"],
      default: "Web Development"
    },
    level: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], default: "Beginner" },
    instructor: { type: String, trim: true, maxlength: 100, default: "Course Staff" },
    price: { type: Number, default: 0, min: 0 },
    lessons: { type: Number, default: 10, min: 1 },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    emoji: { type: String, default: "📘", maxlength: 10 },
    modules: [moduleSchema]
  },
  { timestamps: true }
);

courseSchema.index({ category: 1, level: 1 });

module.exports = mongoose.model("Course", courseSchema);
