const GoalEvent = require("../models/goalEventModel");

// create gol event
const createGoalEvent = async (req, res) => {
  try {
    const { fixture, season, club, player, assist, minute } = req.body;

    const goalEvent = await GoalEvent.create({
      fixture,
      season,
      club,
      player,
      assist: assist || null,
      minute,
    });

    res.status(201).json({
      message: "Goal event berhasil dibuat",
      data: goalEvent,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal membuat goal event",
      error: error.message,
    });
  }
};

// Mengambil Goal Event berdasarkan klub dan musim
const getGoalEvents = async (req, res) => {
  try {
    const { club, season, fixture } = req.query;
    console.log(req.query);

    const filter = {};

    if (club) filter.club = club;
    if (season) filter.season = season;
    if (fixture) filter.fixture = fixture;

    const goalEvents = await GoalEvent.find(filter)
      .populate("club", "name_club logo")
      .populate("player", "name_player number photo")
      .populate("assist", "name_player number photo")
      .populate("fixture")
      .sort({ minute: 1 });

    res.status(200).json({
      message: "Goal event berhasil diambil",
      data: goalEvents,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil goal event",
      error: error.message,
    });
  }
};

// get gol event
// const getGolEvents = async (req, res) => {
//   try {
//     const goalEvents = await GoalEvent.find()
//       .populate("fixture")
//       .populate("club", "name_club logo")
//       .populate("player", "name_player")
//       .populate("assist", "name_player");

//     res.status(200).json({
//       message: "Berhasil mengambil goal event",
//       data: goalEvents,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Gagal mengambil goal event",
//       error: error.message,
//     });
//   }
// };

module.exports = {
  createGoalEvent,
  getGoalEvents,
};
