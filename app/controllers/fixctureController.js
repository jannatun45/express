const mongoose = require("mongoose");
const Fixture = require("../models/fixtureModel");
const Club = require("../models/clubModel");
const generateFixtures = require("../utils/fictureGenerate");
const Standing = require("../models/standingModel");

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
    );

    if (!fixture) {
      return res.status(404).json({
        message: "Fixture tidak ditemukan",
      });
    }

    // Hitung ulang standing
    await recalculateStandings(fixture.season);

    res.status(200).json({
      message: "Score dan standing berhasil diperbarui",
      data: fixture,
    });
  } catch (error) {
    console.error("Update score error:", error);

    res.status(500).json({
      message: "Gagal mengupdate score",
      error: error.message,
    });
  }
};
// Hitung ulang klasemen
const recalculateStandings = async (season) => {
  // 1. Ambil semua club
  const clubs = await Club.find();

  // 2. Hapus standing untuk season ini
  await Standing.deleteMany({
    season,
  });

  // 3. Buat data standing awal
  const standings = clubs.map((club) => ({
    season,
    club: club._id,

    match: 0,
    win: 0,
    draw: 0,
    lose: 0,

    points: 0,

    goals_for: 0,
    goals_againts: 0,
    goal_difference: 0,
  }));

  // 4. Ambil semua fixture yang sudah selesai
  const fixtures = await Fixture.find({
    season,
    status: "finished",
  });

  // 5. Hitung statistik dari fixture
  for (const fixture of fixtures) {
    const homeStanding = standings.find(
      (standing) => standing.club.toString() === fixture.home_club.toString(),
    );

    const awayStanding = standings.find(
      (standing) => standing.club.toString() === fixture.away_club.toString(),
    );

    if (!homeStanding || !awayStanding) {
      continue;
    }

    const homeScore = fixture.home_score ?? 0;
    const awayScore = fixture.away_score ?? 0;

    // =========================
    // MATCH
    // =========================

    homeStanding.match += 1;
    awayStanding.match += 1;

    // =========================
    // GOALS FOR
    // =========================

    homeStanding.goals_for += homeScore;
    awayStanding.goals_for += awayScore;

    // =========================
    // GOALS AGAINST
    // =========================

    homeStanding.goals_againts += awayScore;
    awayStanding.goals_againts += homeScore;

    // =========================
    // RESULT
    // =========================

    if (homeScore > awayScore) {
      // Home menang
      homeStanding.win += 1;
      homeStanding.points += 3;

      // Away kalah
      awayStanding.lose += 1;
    } else if (homeScore < awayScore) {
      // Away menang
      awayStanding.win += 1;
      awayStanding.points += 3;

      // Home kalah
      homeStanding.lose += 1;
    } else {
      // Draw
      homeStanding.draw += 1;
      awayStanding.draw += 1;

      homeStanding.points += 1;
      awayStanding.points += 1;
    }
  }

  // 6. Hitung goal difference
  for (const standing of standings) {
    standing.goal_difference = standing.goals_for - standing.goals_againts;
  }

  // 7. Simpan semua standing ke database
  await Standing.insertMany(standings);

  return standings;
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

// get standing
const getStandings = async (req, res) => {
  try {
    const { season } = req.query;

    if (!season) {
      return res.status(400).json({
        message: "Season wajib diisi",
      });
    }

    const standings = await Standing.find({
      season,
    })
      .populate("club", "name_club logo stadium district")
      .sort({
        points: -1,
        goal_difference: -1,
        goals_for: -1,
      });

    res.status(200).json({
      data: standings,
    });
  } catch (error) {
    console.error("Get standings error:", error);

    res.status(500).json({
      message: "Gagal mengambil standing",
      error: error.message,
    });
  }
};

module.exports = {
  generateSeasonFixtures,
  getFixtures,
  updateScore,
  getClubFixtures,
  getStandings,
};
