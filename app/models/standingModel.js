const mongoose = require("mongoose");

const standingSchema = new mongoose.Schema(
  {
    season: {
      type: String,
      required: true,
    },

    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    },

    match: {
      type: Number,
      default: 0,
    },

    win: {
      type: Number,
      default: 0,
    },

    draw: {
      type: Number,
      default: 0,
    },

    lose: {
      type: Number,
      default: 0,
    },

    points: {
      type: Number,
      default: 0,
    },

    goals_for: {
      type: Number,
      default: 0,
    },

    goals_againts: {
      type: Number,
      default: 0,
    },

    goal_difference: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

standingSchema.index({ season: 1, club: 1 }, { unique: true });

module.exports = mongoose.model("Standing", standingSchema);
