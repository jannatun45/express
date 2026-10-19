// models/Player.js

const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema(
  {
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    },

    name_player: {
      type: String,
      required: true,
      trim: true,
    },
    photo: {
      type: String,
      default: null,
      trim: true,
    },
    position: {
      type: String,
      enum: ["GK", "DF", "MF", "FW"],
      required: true,
    },

    contract_expires: {
      type: Date,
      default: null,
    },

    joined: {
      type: Date,
      default: null,
    },

    national: {
      type: String,
      default: null,
      trim: true,
    },

    market_value: {
      type: Number,
      default: null,
    },

    date_of_birth: {
      type: Date,
      default: null,
    },

    goals: {
      type: Number,
      default: 0,
    },

    assists: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Player", playerSchema);
