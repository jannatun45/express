const Player = require("../models/palyerModel");
const fs = require("fs");
const path = require("path");

const createPlayer = async (req, res) => {
  try {
    const {
      club,
      name_player,
      number,
      position,
      contract_expires,
      joined,
      national,
      market_value,
      date_of_birth,
    } = req.body;

    let photo = null;

    if (req.file) {
      const playersPath = path.join(
        process.cwd(),
        "public",
        "images",
        "players",
      );

      if (!fs.existsSync(playersPath)) {
        fs.mkdirSync(playersPath, {
          recursive: true,
        });
      }

      const extension = path.extname(req.file.originalname);

      const filename = `${Date.now()}-${req.file.filename}${extension}`;

      const targetPath = path.join(playersPath, filename);

      fs.copyFileSync(req.file.path, targetPath);
      fs.unlinkSync(req.file.path);

      photo = `/images/players/${filename}`;
    }

    const player = await Player.create({
      club,
      name_player,
      number,
      position,
      photo,
      contract_expires: contract_expires || null,
      joined: joined || null,
      national: national || null,
      market_value: market_value ? Number(market_value) : null,
      date_of_birth: date_of_birth || null,
    });

    res.status(201).json({
      message: "Player berhasil dibuat",
      data: player,
    });
  } catch (error) {
    console.error("Create player error:", error);

    res.status(500).json({
      message: "Gagal membuat player",
      error: error.message,
    });
  }
};

const getPlayers = async (req, res) => {
  try {
    const players = await Player.find()
      .populate("club", "name_club logo")
      .sort({ name_player: 1 });

    res.status(200).json({
      data: players,
    });
  } catch (error) {
    console.error("Get players error:", error);

    res.status(500).json({
      message: "Gagal mengambil player",
      error: error.message,
    });
  }
};

const getPlayerById = async (req, res) => {
  try {
    const { id } = req.params;

    const player = await Player.findById(id).populate("club", "name_club logo");

    if (!player) {
      return res.status(404).json({
        message: "Player tidak ditemukan",
      });
    }

    res.status(200).json({
      data: player,
    });
  } catch (error) {
    console.error("Get player error:", error);

    res.status(500).json({
      message: "Gagal mengambil player",
      error: error.message,
    });
  }
};

const getPlayersByClub = async (req, res) => {
  try {
    const { clubId } = req.params;

    const players = await Player.find({
      club: clubId,
    }).sort({
      position: 1,
      name_player: 1,
    });

    res.status(200).json({
      data: players,
    });
  } catch (error) {
    console.error("Get players by club error:", error);

    res.status(500).json({
      message: "Gagal mengambil player club",
      error: error.message,
    });
  }
};

const updatePlayer = async (req, res) => {
  try {
    const { id } = req.params;

    const player = await Player.findByIdAndUpdate(id, req.body, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!player) {
      return res.status(404).json({
        message: "Player tidak ditemukan",
      });
    }

    res.status(200).json({
      message: "Player berhasil diperbarui",
      data: player,
    });
  } catch (error) {
    console.error("Update player error:", error);

    res.status(500).json({
      message: "Gagal memperbarui player",
      error: error.message,
    });
  }
};

const deletePlayer = async (req, res) => {
  try {
    const { id } = req.params;

    const player = await Player.findByIdAndDelete(id);

    if (!player) {
      return res.status(404).json({
        message: "Player tidak ditemukan",
      });
    }

    res.status(200).json({
      message: "Player berhasil dihapus",
    });
  } catch (error) {
    console.error("Delete player error:", error);

    res.status(500).json({
      message: "Gagal menghapus player",
      error: error.message,
    });
  }
};

module.exports = {
  createPlayer,
  getPlayers,
  getPlayerById,
  getPlayersByClub,
  updatePlayer,
  deletePlayer,
};
