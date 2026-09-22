const Fixture = require("../models/Fixture");
const Club = require("../models/Club");

const recalculateStandings = async (season) => {
  // Ambil semua club
  const clubs = await Club.find();

  // Reset statistik
  await Club.updateMany(
    {},
    {
      $set: {
        points: 0,
        match: 0,
        win: 0,
        lose: 0,
        goals_for: 0,
        goals_againts: 0,
        goal_difference: 0,
      },
    },
  );

  // Ambil pertandingan yang sudah selesai
  const fixtures = await Fixture.find({
    season,
    status: "finished",
  });

  for (const fixture of fixtures) {
    const homeClub = clubs.find(
      (club) => club._id.toString() === fixture.home_club.toString(),
    );

    const awayClub = clubs.find(
      (club) => club._id.toString() === fixture.away_club.toString(),
    );

    if (!homeClub || !awayClub) {
      continue;
    }

    const homeScore = fixture.home_score ?? 0;
    const awayScore = fixture.away_score ?? 0;

    // Jumlah pertandingan
    homeClub.match += 1;
    awayClub.match += 1;

    // Gol
    homeClub.goals_for += homeScore;
    homeClub.goals_againts += awayScore;

    awayClub.goals_for += awayScore;
    awayClub.goals_againts += homeScore;

    // Menentukan hasil
    if (homeScore > awayScore) {
      // Home menang
      homeClub.win += 1;
      homeClub.points += 3;

      awayClub.lose += 1;
    } else if (homeScore < awayScore) {
      // Away menang
      awayClub.win += 1;
      awayClub.points += 3;

      homeClub.lose += 1;
    } else {
      // Seri
      homeClub.points += 1;
      awayClub.points += 1;
    }
  }

  // Hitung selisih gol
  for (const club of clubs) {
    club.goal_difference = club.goals_for - club.goals_againts;

    await club.save();
  }
};

module.exports = recalculateStandings;
