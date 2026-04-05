const mongoose = require("mongoose");
module.exports = async () => {
  // Connect to MongoDB
  mongoose.connect(
    "mongodb+srv://rajaking01300_db_user:6zUMkN4xAugaaIcR@cluster0.xolgl2r.mongodb.net/?appName=Cluster0",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 2000,
      connectTimeoutMS: 3000,
      socketTimeoutMS: 10000,
    }
  );
  // Get the default connection
  const db = mongoose.connection;
  return db;
};