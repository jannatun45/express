const Fixture = require("../models/Fixture");
const Club = require("../models/Club");
const Standing = require("../models/Standing");

const recalculateStandings = async (season) => {
  // Ambil semua club
  const clubs = await Club.find();

  // Hapus standing season tersebut
  await Standing.deleteMany({
    season,
  });

  // Buat standing awal untuk setiap club
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

  // Ambil semua fixture yang sudah selesai
  const fixtures = await Fixture.find({
    season,
    status: "finished",
  });

  // Hitung setiap pertandingan
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

    // Jumlah pertandingan
    homeStanding.match += 1;
    awayStanding.match += 1;

    // Goals For
    homeStanding.goals_for += homeScore;
    awayStanding.goals_for += awayScore;

    // Goals Against
    homeStanding.goals_againts += awayScore;
    awayStanding.goals_againts += homeScore;

    // Menentukan hasil pertandingan
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
      // Seri
      homeStanding.draw += 1;
      awayStanding.draw += 1;

      homeStanding.points += 1;
      awayStanding.points += 1;
    }
  }

  // Hitung goal difference
  for (const standing of standings) {
    standing.goal_difference = standing.goals_for - standing.goals_againts;
  }

  // Simpan semuanya
  await Standing.insertMany(standings);

  return standings;
};

module.exports = recalculateStandings;
