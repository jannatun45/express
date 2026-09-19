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
const updateScore = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { home_score, away_score } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 1,
        message: "ID pertandingan tidak valid",
      });
    }

    if (home_score === undefined || away_score === undefined) {
      return res.status(400).json({
        error: 1,
        message: "home_score dan away_score wajib diisi",
      });
    }

    if (
      !Number.isInteger(home_score) ||
      !Number.isInteger(away_score) ||
      home_score < 0 ||
      away_score < 0
    ) {
      return res.status(400).json({
        error: 1,
        message: "Score harus berupa angka bulat dan tidak boleh negatif",
      });
    }

    const fixture = await Fixture.findById(id);

    if (!fixture) {
      return res.status(404).json({
        error: 1,
        message: "Pertandingan tidak ditemukan",
      });
    }

    // Simpan hasil pertandingan
    fixture.home_score = home_score;
    fixture.away_score = away_score;
    fixture.status = "finished";

    await fixture.save();

    // Hitung ulang klasemen
    await recalculateStandings(fixture.season);

    const result = await Fixture.findById(id)
      .populate("home_club", "name_club logo")
      .populate("away_club", "name_club logo");

    return res.json({
      error: 0,
      message: "Score berhasil diperbarui",
      data: result,
    });
  } catch (error) {
    next(error);
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

module.exports = {
  generateSeasonFixtures,
  getFixtures,
  updateScore,
};
