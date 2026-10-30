const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 150
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student"
    },
    rollNo: { type: String, trim: true, maxlength: 40 },
    adminId: { type: String, trim: true, uppercase: true, maxlength: 40, unique: true, sparse: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
