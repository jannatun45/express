const mongoose = require("mongoose");

const fixtureSchema = new mongoose.Schema(
  {
    // Musim liga
    season: {
      type: String,
      required: true,
    },

    // Pekan pertandingan
    matchday: {
      type: Number,
      required: true,
    },

    // Club kandang
    home_club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    },

    // Club tandang
    away_club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    },

    // Waktu pertandingan
    match_date: {
      type: Date,
      default: null,
    },

    // Hasil pertandingan
    home_score: {
      type: Number,
      default: null,
    },

    away_score: {
      type: Number,
      default: null,
    },

    // Status pertandingan
    status: {
      type: String,
      enum: ["scheduled", "finished", "postponed"],
      default: "scheduled",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Fixture", fixtureSchema);
