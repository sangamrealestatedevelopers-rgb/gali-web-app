const mongoose = require("mongoose");
module.exports = async () => {
  // Connect to MongoDB
  mongoose.connect(
    "mongodb+srv://sangamrealestatedevelopers_db_user:tbsuUEmt40LqJ5Pp@mt-gali.va0c1wh.mongodb.net/?appName=mt-gali",
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