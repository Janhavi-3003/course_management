const mongoose = require("mongoose");

const learningProgressSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    completedLessons: { type: Number, default: 0, min: 0 },
    totalLessons: { type: Number, default: 0, min: 0 },
    progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
    // module-level tracking used by the course player (photo + video + theory)
    completedModules: [{ type: String }],
    moduleProgress: { type: mongoose.Schema.Types.Mixed, default: {} },
    lastActiveAt: { type: Date }
  },
  { timestamps: true, minimize: false }
);

learningProgressSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("LearningProgress", learningProgressSchema);
