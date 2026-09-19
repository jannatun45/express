// models/TopScore.js

import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const TopScore = sequelize.define(
  "TopScore",
  {
    id_top_score: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    id_player: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    id_league: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    id_season: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    goals: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "top_scores",
    timestamps: true,
  }
);

export default TopScore;