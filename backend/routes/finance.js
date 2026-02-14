const router = require("express").Router();
const Transaction = require("../models/Transaction");
const auth = require("../middleware/authMiddleware");

// Adicionar transação
router.post("/add", auth, async (req, res) => {
  try {
    const { type, category, value, month } = req.body; // adiciona month

    const transaction = await Transaction.create({
      userId: req.user,
      type,
      category,
      value,
      month, // salva o mês
    });

    res.json(transaction);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buscar transações do usuário
router.get("/", auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      userId: req.user
    });

    res.json(transactions);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//delete
router.delete("/:id", auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user
    });

    if (!transaction) {
      return res.status(404).json({ error: "Movimentação não encontrada" });
    }

    await transaction.deleteOne();

    res.json({ message: "Movimentação removida com sucesso" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
