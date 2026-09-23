const mongoose = require("mongoose");

const clubSchema = new mongoose.Schema(
  {
    name_club: {
      type: String,
      required: true,
      trim: true,
    },

    logo: {
      type: String,
      default: null,
      trim: true,
    },

    stadium: {
      type: String,
      default: null,
    },

    district: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Club", clubSchema);
