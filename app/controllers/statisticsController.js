const GoalEvent = require("../models/goalEventModel");

const getTopScorers = async (req, res, next) => {
  try {
    const { season } = req.query;

    const matchStage = {};

    // Filter berdasarkan musim jika parameter season dikirim
    if (season) {
      matchStage.season = season;
    }

    const topScorers = await GoalEvent.aggregate([
      // 1. Filter berdasarkan musim
      {
        $match: matchStage,
      },

      // 2. Kelompokkan gol berdasarkan pemain
      {
        $group: {
          _id: "$player",
          totalGoals: { $sum: 1 },
        },
      },

      // 3. Urutkan dari jumlah gol terbanyak
      {
        $sort: {
          totalGoals: -1,
          _id: 1,
        },
      },

      // 4. Ambil maksimal 10 pemain
      {
        $limit: 10,
      },

      // 5. Ambil data pemain dan klub
      {
        $lookup: {
          from: "players",
          localField: "_id",
          foreignField: "_id",
          as: "player",
        },
      },
      {
        $unwind: "$player",
      },
      {
        $lookup: {
          from: "clubs",
          localField: "player.club",
          foreignField: "_id",
          as: "club",
        },
      },
      {
        $unwind: {
          path: "$club",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 6. Tentukan data yang dikembalikan
      {
        $project: {
          _id: 0,
          playerId: "$player._id",
          playerName: "$player.name_player",
          clubId: "$club._id",
          clubName: "$club.name_club",
          totalGoals: 1,
        },
      },
    ]);

    res.status(200).json({
      message: "Berhasil mengambil data top scorers",
      data: topScorers,
    });
  } catch (error) {
    next(error);
  }
};

const getTopAssists = async (req, res, next) => {
  try {
    const { season } = req.query;
    console.log("season: ", season);

    const matchStage = {
      assist: { $exists: true, $ne: null },
    };

    // Filter berdasarkan musim jika parameter season dikirim
    if (season) {
      matchStage.season = season;
    }

    const topAssists = await GoalEvent.aggregate([
      // 1. Filter berdasarkan musim dan gol yang memiliki assist
      {
        $match: matchStage,
      },

      // 2. Kelompokkan berdasarkan pemain pemberi assist
      {
        $group: {
          _id: "$assist",
          totalAssists: { $sum: 1 },
        },
      },

      // 3. Urutkan dari assist terbanyak
      {
        $sort: {
          totalAssists: -1,
          _id: 1,
        },
      },

      // 4. Ambil maksimal 10 pemain
      {
        $limit: 10,
      },

      // 5. Ambil data pemain
      {
        $lookup: {
          from: "players",
          localField: "_id",
          foreignField: "_id",
          as: "player",
        },
      },
      {
        $unwind: "$player",
      },

      // 6. Ambil data klub pemain
      {
        $lookup: {
          from: "clubs",
          localField: "player.club",
          foreignField: "_id",
          as: "club",
        },
      },
      {
        $unwind: {
          path: "$club",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 7. Tentukan data yang dikembalikan
      {
        $project: {
          _id: 0,
          playerId: "$player._id",
          playerName: "$player.name_player",
          clubId: "$club._id",
          clubName: "$club.name_club",
          totalAssists: 1,
        },
      },
    ]);

    res.status(200).json({
      message: "Berhasil mengambil data top assists",
      data: topAssists,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTopScorers,
  getTopAssists,
};
