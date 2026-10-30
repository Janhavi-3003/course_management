const mongoose = require("mongoose");

// Hours learned per student per day (feeds the dashboard charts)
const activitySchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    hours: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);

activitySchema.index({ student: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Activity", activitySchema);
