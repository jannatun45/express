const express = require("express");

const router = express.Router();

const sanctionController = require("../controllers/sanctionController");

// GET semua sanksi
router.get("/", sanctionController.getSanctions);

// GET sanksi berdasarkan ID
router.get("/:id", sanctionController.getSanctionById);

// POST tambah sanksi
router.post("/", sanctionController.createSanction);

// PUT update sanksi
router.put("/:id", sanctionController.updateSanction);

// DELETE hapus sanksi
router.delete("/:id", sanctionController.deleteSanction);

module.exports = router;
