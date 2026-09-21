// models/Club.js

const mongoose = require("mongoose");

const clubSchema = new mongoose.Schema(
  {
    // ID Player yang berhubungan dengan club
    id_player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
    },

    matches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Fixture",
      },
    ],

    points: {
      type: Number,
      default: 0,
    },

    logo: {
      type: String,
      default: null,
      trim: true,
    },

    name_club: {
      type: String,
      required: true,
      trim: true,
    },

    stadium: {
      type: String,
      default: null,
    },

    // jumlah pertandingan
    match: {
      type: Number,
      default: 0,
    },

    // jumlah kemenangan
    win: {
      type: Number,
      default: 0,
    },

    // Jumlah kekalahan
    lose: {
      type: Number,
      default: 0,
    },

    // Jumlah gol yang dicetak
    goals_for: {
      type: Number,
      default: 0,
    },

    // Jumlah gol yang kemasukan
    goals_againts: {
      type: Number,
      default: 0,
    },

    // Selisih gol
    goal_difference: {
      type: Number,
      default: 0,
    },

    district: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Club", clubSchema);
