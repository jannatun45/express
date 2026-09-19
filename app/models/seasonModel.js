// models/Season.js

import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Season = sequelize.define(
  "Season",
  {
    id_season: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    name_season: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    tableName: "seasons",
    timestamps: true,
  }
);

export default Season;