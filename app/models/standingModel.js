// models/Standing.js

import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Standing = sequelize.define(
  "Standing",
  {
    id_standing: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    id_club: {
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

    position: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    played: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    win: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    draw: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    lose: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    goals_for: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    goals_against: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    goal_difference: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    points: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "standings",
    timestamps: true,
  }
);

export default Standing;