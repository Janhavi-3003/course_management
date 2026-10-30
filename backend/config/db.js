const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

let memoryServer = null;

// Uses MONGO_URI when set. In development with no MONGO_URI, starts a built-in
// local MongoDB (mongodb-memory-server) whose data is stored in backend/data.
async function resolveUri() {
  if (process.env.MONGO_URI) return process.env.MONGO_URI;
  if (process.env.NODE_ENV === "production") {
    throw new Error("MONGO_URI is not configured");
  }
  let MongoMemoryServer;
  try {
    ({ MongoMemoryServer } = require("mongodb-memory-server"));
  } catch (e) {
    throw new Error(
      "MONGO_URI is not configured. Put your MongoDB / Atlas connection string in backend/.env"
    );
  }
  const dbPath = path.join(__dirname, "..", "data", "mongodb");
  fs.mkdirSync(dbPath, { recursive: true });
  console.log(
    "MONGO_URI is empty -> starting built-in local MongoDB (the first run downloads the MongoDB binary, please wait)..."
  );
  memoryServer = await MongoMemoryServer.create({
    instance: { dbPath, storageEngine: "wiredTiger" }
  });
  return memoryServer.getUri("course_management");
}

async function connectDB(uri) {
  const target = uri || (await resolveUri());
  mongoose.set("strictQuery", true);
  await mongoose.connect(target, { serverSelectionTimeoutMS: 15000 });
  console.log("MongoDB connected successfully");
}

async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop({ doCleanup: false });
    memoryServer = null;
  }
}

module.exports = connectDB;
module.exports.disconnectDB = disconnectDB;
