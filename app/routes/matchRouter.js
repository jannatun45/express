const router = require("express").Router();

const matchController = require("../controllers/matchController");

// GET MATCHES / Ambil jadwal pertandingan
router.get("/matches", matchController.getMatches);

// GET MATCHES ID / Ambil jadwal pertandingan berdasarkan club
router.get("/matches/club/:clubId", matchController.getClubMatch);

// UPDATE MATCH / Update jadwal pertandingan
router.put("/matches/:id", matchController.updateMatch);

// UPDATE SCORE / Update score pertandingan
router.put("/matches/:id/score", matchController.updateScore);

// DELETE MATCH RESULT / Hapus hasil pertandingan
router.delete("/matches/:id/result", matchController.deleteMatchResult);

module.exports = router;
