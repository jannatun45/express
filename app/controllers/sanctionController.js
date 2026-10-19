const Sanction = require("../models/Sanction");
const Club = require("../models/Club");

// ===============================
// CREATE SANCTION
// ===============================
exports.createSanction = async (req, res) => {
  try {
    const { club, season, points, reason } = req.body;

    if (!club || !season || points === undefined || !reason) {
      return res.status(400).json({
        message: "club, season, points, dan reason wajib diisi",
      });
    }

    // Pastikan club ada
    const existingClub = await Club.findById(club);

    if (!existingClub) {
      return res.status(404).json({
        message: "Club tidak ditemukan",
      });
    }

    // Pastikan sanksi berupa pengurangan poin
    if (points >= 0) {
      return res.status(400).json({
        message: "Poin sanksi harus berupa angka negatif",
      });
    }

    const sanction = await Sanction.create({
      club,
      season,
      points,
      reason,
    });

    const result = await Sanction.findById(sanction._id).populate(
      "club",
      "name_club logo",
    );

    return res.status(201).json({
      message: "Sanksi berhasil ditambahkan",
      data: result,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Gagal menambahkan sanksi",
      error: error.message,
    });
  }
};

// ===============================
// GET ALL SANCTIONS
// ===============================
exports.getSanctions = async (req, res) => {
  try {
    const { season, club } = req.query;

    const filter = {};

    if (season) {
      filter.season = season;
    }

    if (club) {
      filter.club = club;
    }

    const sanctions = await Sanction.find(filter)
      .populate("club", "name_club logo")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      data: sanctions,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Gagal mengambil data sanksi",
      error: error.message,
    });
  }
};

// ===============================
// GET SANCTION BY ID
// ===============================
exports.getSanctionById = async (req, res) => {
  try {
    const sanction = await Sanction.findById(req.params.id).populate(
      "club",
      "name_club logo",
    );

    if (!sanction) {
      return res.status(404).json({
        message: "Sanksi tidak ditemukan",
      });
    }

    return res.status(200).json({
      data: sanction,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Gagal mengambil sanksi",
      error: error.message,
    });
  }
};

// ===============================
// UPDATE SANCTION
// ===============================
exports.updateSanction = async (req, res) => {
  try {
    const { points, reason } = req.body;

    if (points !== undefined && points >= 0) {
      return res.status(400).json({
        message: "Poin sanksi harus berupa angka negatif",
      });
    }

    const sanction = await Sanction.findByIdAndUpdate(
      req.params.id,
      {
        ...(points !== undefined && { points }),
        ...(reason !== undefined && { reason }),
      },
      {
        new: true,
        runValidators: true,
      },
    ).populate("club", "name_club logo");

    if (!sanction) {
      return res.status(404).json({
        message: "Sanksi tidak ditemukan",
      });
    }

    return res.status(200).json({
      message: "Sanksi berhasil diperbarui",
      data: sanction,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Gagal memperbarui sanksi",
      error: error.message,
    });
  }
};

// ===============================
// DELETE SANCTION
// ===============================
exports.deleteSanction = async (req, res) => {
  try {
    const sanction = await Sanction.findByIdAndDelete(req.params.id);

    if (!sanction) {
      return res.status(404).json({
        message: "Sanksi tidak ditemukan",
      });
    }

    return res.status(200).json({
      message: "Sanksi berhasil dihapus",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Gagal menghapus sanksi",
      error: error.message,
    });
  }
};
