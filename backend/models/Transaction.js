const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  type: { type: String, enum: ["receita", "gasto"], required: true },
  category: { type: String, required: true }, // descrição
  value: { type: Number, required: true },
  month: { type: Number, min: 1, max: 12, required: true }, // novo campo
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Transaction", TransactionSchema);