// models/Coach.js

import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Coach = sequelize.define(
  "Coach",
  {
    id_coach: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    name_coach: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    coaching_licence: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    tableName: "coaches",
    timestamps: true,
  }
);

export default Coach;