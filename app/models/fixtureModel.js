const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    },

    scorer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      required: true,
    },

    minute: {
      type: Number,
      required: true,
    },

    assist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      default: null,
    },
  },
  {
    _id: true,
  },
);

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
