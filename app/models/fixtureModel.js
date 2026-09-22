const mongoose = require("mongoose");

// Detail setiap gol
const goalSchema = new mongoose.Schema(
  {
    // Club yang mencetak gol
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    },

    // Player yang mencetak gol
    scorer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      required: true,
    },

    // Menit terjadinya gol
    minute: {
      type: Number,
      required: true,
      min: 1,
    },

    // Player yang memberikan assist
    // null jika gol berasal dari penalty
    assist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      default: null,
    },

    // Apakah gol berasal dari penalty
    is_penalty: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true },
);

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
      default: 0,
    },

    draw: {
      type: Number,
      default: 0,
    },

    away_score: {
      type: Number,
      default: 0,
    },

    // Status pertandingan
    status: {
      type: String,
      enum: ["scheduled", "finished", "postponed"],
      default: "scheduled",
    },

    // Daftar gol
    goals: {
      type: [goalSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Fixture", fixtureSchema);
