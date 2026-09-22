const generateMatches = (clubs) => {
  const teams = [...clubs];

  // Jika jumlah club ganjil, tambahkan BYE
  if (teams.length % 2 !== 0) {
    teams.push(null);
  }

  const totalTeams = teams.length;
  const matchesPerRound = totalTeams / 2;
  const rounds = totalTeams - 1;

  const matches = [];

  let currentTeams = [...teams];

  // Putaran pertama
  for (let round = 0; round < rounds; round++) {
    const matchday = round + 1;

    for (let i = 0; i < matchesPerRound; i++) {
      const home = currentTeams[i];
      const away = currentTeams[totalTeams - 1 - i];

      // Lewati club yang mendapat BYE
      if (!home || !away) {
        continue;
      }

      matches.push({
        matchday,
        home_club: home._id,
        away_club: away._id,
      });
    }

    // Rotasi club untuk matchday berikutnya
    currentTeams = [
      currentTeams[0],
      currentTeams[totalTeams - 1],
      ...currentTeams.slice(1, totalTeams - 1),
    ];
  }

  // Simpan hasil putaran pertama
  const firstRound = [...matches];

  // Putaran kedua
  // Home dan away ditukar
  for (const match of firstRound) {
    matches.push({
      matchday: match.matchday + rounds,
      home_club: match.away_club,
      away_club: match.home_club,
    });
  }

  return matches;
};

module.exports = generateMatches;
