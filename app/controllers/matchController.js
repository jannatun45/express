const mongoose = require("mongoose");
const Fixture = require("../models/fixtureModel");
const Club = require("../models/clubModel");
const Standing = require("../models/standingModel");
const GoalEvent = require("../models/goalEventModel");

// GET MATCHES / Mengambil jadwal pertandingan
const getMatches = async (req, res, next) => {
  try {
    const { season } = req.query;

    const filter = {};

    if (season) {
      filter.season = season;
    }

    const match = await Fixture.find(filter)
      .populate("home_club", "name_club logo stadium")
      .populate("away_club", "name_club logo stadium")
      .sort({
        matchday: 1,
        match_date: 1,
      });

    const matchesWithGoals = await Promise.all(
      match.map(async (fixture) => {
        const goals = await GoalEvent.find({
          fixture: fixture._id,
        })
          .populate("club", "name_club logo")
          .populate("player", "name_player number photo")
          .populate("assist", "name_player number photo")
          .sort({ minute: 1 });

        return {
          ...fixture.toObject(),
          goals,
        };
      }),
    );

    return res.json(matchesWithGoals);
  } catch (error) {
    next(error);
  }
};

// GET CLUB MATCH / Ambil jadwal pertandingan berdasarkan club

const getClubMatch = async (req, res, next) => {
  try {
    // Mengambil clubId dari parameter URL.
    const { clubId } = req.params;

    // Mengambil season dari query URL.
    // Contoh: /clubs/123/matches?season=2026
    const { season } = req.query;

    // Filter untuk mencari pertandingan klub.
    const filter = {
      // Mencari pertandingan saat clubId menjadi HOME atau AWAY.
      $or: [{ home_club: clubId }, { away_club: clubId }],
    };

    // Jika season diberikan, tambahkan filter season.
    // Jika tidak diberikan, pertandingan dari semua season
    // akan ditampilkan.
    if (season) {
      filter.season = season;
    }

    // Mengambil pertandingan sesuai clubId dan season.
    const match = await Fixture.find(filter)

      // Mengambil detail klub kandang.
      .populate("home_club", "name_club logo")

      // Mengambil detail klub tandang.
      .populate("away_club", "name_club logo")

      // Mengurutkan berdasarkan season dan matchday.
      .sort({
        season: 1,
        matchday: 1,
      });

    // Mengambil event gol untuk setiap pertandingan.
    // Promise.all menunggu semua event gol selesai diambil.
    const matchesWithGoals = await Promise.all(
      match.map(async (fixture) => {
        // Mencari semua event gol berdasarkan ID pertandingan.
        const goals = await GoalEvent.find({
          fixture: fixture._id,
        })

          // Mengambil detail klub pencetak gol.
          .populate("club", "name_club logo")

          // Mengambil detail pemain pencetak gol.
          .populate("player", "name_player number photo")

          // Mengambil detail pemain pemberi assist.
          .populate("assist", "name_player number photo")

          // Mengurutkan event gol berdasarkan menit kejadian.
          .sort({ minute: 1 });

        // Menggabungkan data pertandingan dengan event gol.
        return {
          ...fixture.toObject(),
          goals,
        };
      }),
    );

    // Mengirim pertandingan beserta event gol ke frontend.
    return res.json(matchesWithGoals);
  } catch (error) {
    // Meneruskan error ke middleware Express.
    next(error);
  }
};

// const getClubMatch = async (req, res, next) => {
//   try {
//     const { clubId } = req.params;

//     const matches = await Fixture.find({
//       // $or artinya:
//       // "cari data yang memenuhi SALAH SATU
//       // dari kondisi berikut"
//       $or: [
//         // Kondisi pertama:
//         // clubId merupakan club yang bermain sebagai HOME
//         { home_club: clubId },

//         // Kondisi kedua:
//         // clubId merupakan club yang bermain sebagai AWAY
//         { away_club: clubId },
//       ],
//     })

//       // Mengambil data club home dari ObjectId
//       // lalu menggantinya dengan data club yang sebenarnya.
//       //
//       // "name_club logo" artinya kita hanya mengambil
//       // field name_club dan logo dari collection Club.
//       .populate("home_club", "name_club logo")

//       // Sama seperti sebelumnya,
//       // tetapi untuk club yang bermain sebagai away.
//       .populate("away_club", "name_club logo")

//       // Mengurutkan pertandingan berdasarkan:
//       //
//       // 1. season ASC
//       // 2. matchday ASC
//       //
//       // Angka 1 berarti ascending (kecil -> besar).
//       .sort({
//         season: 1,
//         matchday: 1,
//       });

//     // Mengirim hasil pertandingan ke frontend
//     // dalam bentuk JSON.
//     return res.json(matches);
//   } catch (error) {
//     // Kalau terjadi error,
//     // kirim error tersebut ke middleware error handler Express.
//     next(error);
//   }
// };

// UPDATE MATCH / Update jadwal pertandingan
const updateMatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { matchday, match_date } = req.body;

    if (matchday === undefined || !match_date) {
      return res.status(400).json({
        message: "Matchday dan waktu pertandingan wajib diisi",
      });
    }

    const match = await Fixture.findByIdAndUpdate(
      id,
      {
        matchday: Number(matchday),
        match_date: new Date(match_date),
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    )
      .populate("home_club", "name_club logo")
      .populate("away_club", "name_club logo");

    if (!match) {
      return res.status(404).json({
        message: "Match tidak ditemukan",
      });
    }

    res.status(200).json({
      message: "Jadwal pertandingan berhasil diperbarui",
      data: match,
    });
  } catch (error) {
    console.error("Update match error:", error);

    res.status(500).json({
      message: "Gagal memperbarui jadwal pertandingan",
      error: error.message,
    });
  }
};
//  DELETE MATCH / atau reset hasil pertandingan
const deleteMatchResult = async (req, res) => {
  try {
    const { id } = req.params;

    const fixture = await Fixture.findByIdAndUpdate(
      id,
      {
        home_score: null,
        away_score: null,
        goals: [],
        status: "scheduled",
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

    // Hitung ulang standing karena hasil pertandingan sudah dihapus
    await recalculateStandings(fixture.season);

    res.status(200).json({
      message: "Hasil pertandingan berhasil direset",
      data: fixture,
    });
  } catch (error) {
    console.error("Reset fixture result error:", error);

    res.status(500).json({
      message: "Gagal mereset hasil pertandingan",
      error: error.message,
    });
  }
};
// UPDATE SCORE / Update score pertandingan
const updateScore = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      matchday,
      match_date,
      home_score,
      away_score,
      goals = [],
    } = req.body;

    // Validasi ID pertandingan
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "ID pertandingan tidak valid",
      });
    }

    // Mengirimkan hasil pertandingan dan data gol terbaru ke frontend
    if (home_score === undefined || away_score === undefined) {
      return res.status(400).json({
        message: "Home score dan away score wajib diisi",
      });
    }

    // Validasi skor
    if (
      !Number.isInteger(home_score) ||
      !Number.isInteger(away_score) ||
      home_score < 0 ||
      away_score < 0
    ) {
      return res.status(400).json({
        message: "Skor harus berupa bilangan bulat dan tidak negatif",
      });
    }

    // Mengirimkan hasil pertandingan dan data gol terbaru ke frontend
    if (home_score === undefined || away_score === undefined) {
      return res.status(400).json({
        message: "Home score dan away score wajib diisi",
      });
    }

    if (!Array.isArray(goals)) {
      return res.status(400).json({
        message: "Data goals harus berupa array",
      });
    }

    const fixture = await Fixture.findById(id);

    if (!fixture) {
      return res.status(404).json({
        message: "Pertandingan tidak ditemukan",
      });
    }

    // Validasi seluruh data gol sebelum mengubah data pertandingan
    const goalDocuments = [];

    for (const goal of goals) {
      // Mendukung nama player atau scorer dari frontend
      const playerId = goal.player || goal.scorer;

      if (
        !mongoose.isValidObjectId(goal.club) ||
        !mongoose.isValidObjectId(playerId) ||
        (goal.assist && !mongoose.isValidObjectId(goal.assist))
      ) {
        return res.status(400).json({
          message: "ID klub, pencetak gol, atau assist tidak valid",
        });
      }

      // if (
      //   !Number.isInteger(goal.minute) ||
      //   goal.minute < 1 ||
      //   goal.minute > 130
      // ) {
      //   return res.status(400).json({
      //     message: "Menit gol harus antara 1 dan 130",
      //   });
      // }

      const isHomeClub = String(fixture.home_club) === String(goal.club);

      const isAwayClub = String(fixture.away_club) === String(goal.club);

      if (!isHomeClub && !isAwayClub) {
        return res.status(400).json({
          message: "Klub pencetak gol bukan peserta pertandingan ini",
        });
      }

      if (goal.assist && String(goal.assist) === String(playerId)) {
        return res.status(400).json({
          message: "Pencetak gol dan pemberi assist harus berbeda",
        });
      }

      goalDocuments.push({
        fixture: fixture._id,
        season: fixture.season,
        club: goal.club,
        player: playerId,
        assist: goal.assist || null,
        minute: goal.minute,
      });
    }

    // Perbarui hasil pertandingan
    fixture.home_score = home_score;
    fixture.away_score = away_score;
    fixture.status = "finished";

    if (matchday !== undefined) {
      fixture.matchday = matchday;
    }

    if (match_date !== undefined) {
      fixture.match_date = match_date || null;
    }

    await fixture.save();

    // Hapus data gol lama agar tidak terjadi duplikasi.
    await GoalEvent.deleteMany({
      fixture: fixture._id,
    });

    // Simpan kembali semua gol terbaru.
    if (goalDocuments.length > 0) {
      await GoalEvent.insertMany(goalDocuments);
    }

    // panggil di sini agar klasemen diperbarui.
    await recalculateStandings(fixture.season);

    const savedGoals = await GoalEvent.find({
      fixture: fixture._id,
    })
      .populate("club", "name_club logo")
      .populate("player", "name_player number photo")
      .populate("assist", "name_player number photo")
      .sort({ minute: 1 });

    // const fixture = await Fixture.findByIdAndUpdate(
    //   id,
    //   {
    //     home_score,
    //     away_score,
    //     goals,
    //     status: "finished",
    //   },
    //   {
    //     returnDocument: "after",
    //     runValidators: true,
    //   },
    // );

    // if (!fixture) {
    //   return res.status(404).json({
    //     message: "Fixture tidak ditemukan",
    //   });
    // }

    // // Hitung ulang standing
    // await recalculateStandings(fixture.season);

    return res.status(200).json({
      message: "Hasil pertandingan dan Goal Event berhasil disimpan",
      data: {
        fixture,
        goals: savedGoals,
      },
    });
  } catch (error) {
    console.error("Update score error:", error);

    res.status(500).json({
      message: "Gagal mengupdate score",
      error: error.message,
    });
  }
};
//  Hitung ulang klasemen
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

module.exports = {
  getMatches,
  getClubMatch,
  updateScore,
  updateMatch,
  deleteMatchResult,
};
