const mongoose = require("mongoose");
const Fixture = require("../models/fixtureModel");
const Club = require("../models/clubModel");
const generateFixtures = require("../utils/fictureGenerate");

// Generate seluruh jadwal satu season
const generateSeasonFixtures = async (req, res, next) => {
  try {
    const { season } = req.body;

    if (!season) {
      return res.status(400).json({
        error: 1,
        message: "Season wajib diisi",
      });
    }

    const clubs = await Club.find().select("_id");

    if (clubs.length < 2) {
      return res.status(400).json({
        error: 1,
        message: "Minimal harus ada 2 club",
      });
    }

    // Cegah pembuatan jadwal dua kali
    const existingFixtures = await Fixture.countDocuments({
      season,
    });

    if (existingFixtures > 0) {
      return res.status(400).json({
        error: 1,
        message: `Jadwal season ${season} sudah dibuat`,
      });
    }

    // Generate pertandingan home dan away
    const generatedFixtures = generateFixtures(clubs);

    const fixtures = generatedFixtures.map((fixture) => ({
      season,
      matchday: fixture.matchday,
      home_club: fixture.home_club,
      away_club: fixture.away_club,
      match_date: null,
    }));

    const result = await Fixture.insertMany(fixtures);

    return res.status(201).json({
      error: 0,
      message: `Berhasil membuat ${result.length} pertandingan`,
      total: result.length,
    });
  } catch (error) {
    next(error);
  }
};

// Mengambil jadwal pertandingan
const getFixtures = async (req, res, next) => {
  try {
    const { season } = req.query;

    const filter = {};

    if (season) {
      filter.season = season;
    }

    const fixtures = await Fixture.find(filter)
      .populate("home_club", "name_club logo stadium")
      .populate("away_club", "name_club logo stadium")
      .sort({
        matchday: 1,
        match_date: 1,
      });

    return res.json(fixtures);
  } catch (error) {
    next(error);
  }
};

// Update score pertandingan
const updateScore = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("id in params update score -> ", req.params.id);
    console.log("id in params update score -> ", req.body.home_score);
    console.log("id in params update score -> ", req.body.away_score);

    const { home_score, away_score } = req.body;

    if (home_score === undefined || away_score === undefined) {
      return res.status(400).json({
        message: "Home score dan away score wajib diisi",
      });
    }

    const fixture = await Fixture.findByIdAndUpdate(
      id,
      {
        home_score,
        away_score,
        status: "finished",
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    )
      .populate("home_club", "name_club logo")
      .populate("away_club", "name_club logo");

    if (!fixture) {
      return res.status(404).json({
        message: "Fixture tidak ditemukan",
      });
    }

    res.json({
      message: "Score berhasil diperbarui",
      data: fixture,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Gagal mengupdate score",
      error: error.message,
    });
  }
};

// Hitung ulang klasemen
const recalculateStandings = async (season) => {
  const clubs = await Club.find();

  // Reset statistik
  for (const club of clubs) {
    club.points = 0;
    club.match = 0;
    club.win = 0;
    club.draw = 0;
    club.lose = 0;
    club.goals_for = 0;
    club.goals_againts = 0;
    club.goal_difference = 0;

    await club.save();
  }

  // Ambil pertandingan yang sudah selesai
  const fixtures = await Fixture.find({
    season,
    status: "finished",
  });

  // Hitung statistik
  for (const fixture of fixtures) {
    const homeClub = await Club.findById(fixture.home_club);
    const awayClub = await Club.findById(fixture.away_club);

    if (!homeClub || !awayClub) {
      continue;
    }

    const homeScore = fixture.home_score;
    const awayScore = fixture.away_score;

    homeClub.match += 1;
    awayClub.match += 1;

    homeClub.goals_for += homeScore;
    homeClub.goals_againts += awayScore;

    awayClub.goals_for += awayScore;
    awayClub.goals_againts += homeScore;

    if (homeScore > awayScore) {
      homeClub.win += 1;
      homeClub.points += 3;

      awayClub.lose += 1;
    } else if (homeScore < awayScore) {
      awayClub.win += 1;
      awayClub.points += 3;

      homeClub.lose += 1;
    } else {
      homeClub.draw += 1;
      awayClub.draw += 1;

      homeClub.points += 1;
      awayClub.points += 1;
    }

    await homeClub.save();
    await awayClub.save();
  }

  // Hitung selisih gol
  await Club.updateMany({}, [
    {
      $set: {
        goal_difference: {
          $subtract: ["$goals_for", "$goals_againts"],
        },
      },
    },
  ]);
};

const getClubFixtures = async (req, res, next) => {
  try {
    const { clubId } = req.params;

    const fixtures = await Fixture.find({
      // $or artinya:
      // "cari data yang memenuhi SALAH SATU
      // dari kondisi berikut"
      $or: [
        // Kondisi pertama:
        // clubId merupakan club yang bermain sebagai HOME
        { home_club: clubId },

        // Kondisi kedua:
        // clubId merupakan club yang bermain sebagai AWAY
        { away_club: clubId },
      ],
    })

      // Mengambil data club home dari ObjectId
      // lalu menggantinya dengan data club yang sebenarnya.
      //
      // "name_club logo" artinya kita hanya mengambil
      // field name_club dan logo dari collection Club.
      .populate("home_club", "name_club logo")

      // Sama seperti sebelumnya,
      // tetapi untuk club yang bermain sebagai away.
      .populate("away_club", "name_club logo")

      // Mengurutkan pertandingan berdasarkan:
      //
      // 1. season ASC
      // 2. matchday ASC
      //
      // Angka 1 berarti ascending (kecil -> besar).
      .sort({
        season: 1,
        matchday: 1,
      });

    // Mengirim hasil pertandingan ke frontend
    // dalam bentuk JSON.
    return res.json(fixtures);
  } catch (error) {
    // Kalau terjadi error,
    // kirim error tersebut ke middleware error handler Express.
    next(error);
  }
};

module.exports = {
  generateSeasonFixtures,
  getFixtures,
  updateScore,
  getClubFixtures,
};
