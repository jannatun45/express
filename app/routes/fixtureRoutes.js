const router = require("express").Router();

const fixtureController = require("../controllers/fixctureController");

// Generate seluruh jadwal satu musim
router.post("/fixtures/generate", fixtureController.generateSeasonFixtures);

// Ambil jadwal
router.get("/fixtures", fixtureController.getFixtures);

// Input / update hasil pertandingan
router.put("/fixtures/:id/score", fixtureController.updateScore);

router.get("/fixtures/club/:clubId", fixtureController.getClubFixtures);

router.put("/fixtures/:id", fixtureController.updateFixture);

router.get("/standings", fixtureController.getStandings);

// reset fixtures
router.put("/fixtures/:id/reset", fixtureController.resetFixtureResult);

module.exports = router;
