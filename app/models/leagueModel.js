// models/League.js

import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const League = sequelize.define(
  "League",
  {
    id_league: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    name_league: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "leagues",
    timestamps: true,
  }
);

export default League;