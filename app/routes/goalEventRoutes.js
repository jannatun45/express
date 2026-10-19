const express = require("express");
const router = express.Router();

const goalEventControllers = require("../controllers/goalEventController");

router.post("/goal-events", goalEventControllers.createGoalEvent);
router.get("/goal-events", goalEventControllers.getGoalEvents);

module.exports = router;
