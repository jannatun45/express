function generateFixtures(clubs) {
  const teams = [...clubs];

  // Kalau jumlah club ganjil, tambahkan slot BYE
  if (teams.length % 2 !== 0) {
    teams.push(null);
  }

  const totalTeams = teams.length;
  const matchesPerRound = totalTeams / 2;
  const rounds = totalTeams - 1;

  const fixtures = [];

  let currentTeams = [...teams];

  // Putaran pertama
  for (let round = 0; round < rounds; round++) {
    const matchday = round + 1;

    for (let i = 0; i < matchesPerRound; i++) {
      const home = currentTeams[i];
      const away = currentTeams[totalTeams - 1 - i];

      // Abaikan pertandingan BYE
      if (!home || !away) {
        continue;
      }

      fixtures.push({
        matchday,
        home_club: home._id,
        away_club: away._id,
      });
    }

    // Rotasi club
    currentTeams = [
      currentTeams[0],
      currentTeams[totalTeams - 1],
      ...currentTeams.slice(1, totalTeams - 1),
    ];
  }

  // Putaran kedua
  const firstRound = [...fixtures];

  for (const fixture of firstRound) {
    fixtures.push({
      matchday: fixture.matchday + rounds,

      // Home dan away dibalik
      home_club: fixture.away_club,
      away_club: fixture.home_club,
    });
  }

  return fixtures;
}

module.exports = generateFixtures;
