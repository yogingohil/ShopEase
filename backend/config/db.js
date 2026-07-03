const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
  const dbName = process.env.DB_NAME || "shopease";

  mongoose.set("strictQuery", true);

  await mongoose.connect(uri, { dbName });

  console.log(`MongoDB connected -> database "${dbName}"`);

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err.message);
  });

  return mongoose.connection;
}

module.exports = connectDB;
