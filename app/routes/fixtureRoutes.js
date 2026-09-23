const router = require("express").Router();

const fixtureController = require("../controllers/fixctureController");

// Generate seluruh jadwal satu musim
router.post("/fixtures/generate", fixtureController.generateSeasonFixtures);

// Ambil jadwal
router.get("/fixtures", fixtureController.getFixtures);

// Input / update hasil pertandingan
router.put("/fixtures/:id/score", fixtureController.updateScore);

router.get("/fixtures/club/:clubId", fixtureController.getClubFixtures);

router.get("/standings", fixtureController.getStandings);

module.exports = router;
