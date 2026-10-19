const express = require("express");
const router = express.Router();

const {
  getTopScorers,
  getTopAssists,
} = require("../controllers/statisticsController");

router.get("/top-scorers", getTopScorers);
router.get("/top-assists", getTopAssists);

module.exports = router;
