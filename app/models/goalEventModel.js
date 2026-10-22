const mongoose = require("mongoose");

const goalEventSchema = new mongoose.Schema(
  {
    // Pertandingan tempat gol terjadi
    fixture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fixture",
      required: true,
      index: true,
    },

    // Musim kompetisi, contoh: 2026/2027
    season: {
      type: String,
      required: true,
      index: true,
    },

    // Klub yang mencetak gol
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    },

    // Pemain yang mencetak gol
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      required: true,
    },

    // Pemain yang memberi assist (boleh kosong)
    assist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      default: null,
    },

    // Penanda gol bunuh diri
    is_own_goal: {
      type: Boolean,
      default: false,
    },

    // Menit gol, contoh 45 atau 90
    minute: {
      type: Number,
      required: true,
      min: 1,
      max: 130,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("GoalEvent", goalEventSchema);
