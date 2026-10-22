const mongoose = require("mongoose");

const fixtureSchema = new mongoose.Schema(
  {
    season: {
      type: String,
      required: true,
    },

    matchday: {
      type: Number,
      required: true,
    },

    home_club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    },

    away_club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    },

    match_date: {
      type: Date,
      default: null,
    },

    home_score: {
      type: Number,
      default: null,
    },

    away_score: {
      type: Number,
      default: null,
    },

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
