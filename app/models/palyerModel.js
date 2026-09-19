// models/Player.js

import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Player = sequelize.define(
  "Player",
  {
    id_player: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    id_club: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    name_player: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    position: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    contract_expires: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    joined: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    national: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    market_value: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },

    age: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    gol: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    assist: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "players",
    timestamps: true,
  }
);

export default Player;