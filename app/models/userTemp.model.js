const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    mob: { type: String },
    otp: { type: String },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { collection: "userTemps" }
);

module.exports = mongoose.model("userTemp", bookSchema);
