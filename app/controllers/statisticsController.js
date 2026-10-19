const Fixture = require("../models/fixtureModel");

const getTopScorers = async (req, res) => {
  try {
    const { season } = req.query;

    if (!season) {
      return res.status(400).json({
        message: "Season wajib diisi",
      });
    }

    const result = await Fixture.aggregate([
      // Ambil pertandingan berdasarkan musim
      {
        $match: {
          season: season,
          status: "finished",
        },
      },

      // Pecah array goals menjadi satu dokumen per gol
      {
        $unwind: "$goals",
      },

      // Kelompokkan berdasarkan pencetak gol
      {
        $group: {
          _id: "$goals.scorer",
          goals: {
            $sum: 1,
          },
        },
      },

      // Gol terbanyak di atas
      {
        $sort: {
          goals: -1,
        },
      },

      // Ambil data pemain
      {
        $lookup: {
          from: "players",
          localField: "_id",
          foreignField: "_id",
          as: "player",
        },
      },

      // Ubah array player menjadi object
      {
        $unwind: "$player",
      },

      // Ambil data klub
      {
        $lookup: {
          from: "clubs",
          localField: "player.club",
          foreignField: "_id",
          as: "club",
        },
      },

      {
        $unwind: "$club",
      },

      {
        $project: {
          _id: 0,

          player: {
            _id: "$player._id",
            name_player: "$player.name_player",
            photo: "$player.photo",
            position: "$player.position",
          },

          club: {
            _id: "$club._id",
            name_club: "$club.name_club",
            logo: "$club.logo",
          },

          goals: 1,
        },
      },
    ]);

    return res.status(200).json({
      season,
      data: result,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Gagal mengambil Top Score",
      error: error.message,
    });
  }
};

const getTopAssists = async (req, res) => {
  try {
    const { season } = req.query;

    if (!season) {
      return res.status(400).json({
        message: "Season wajib diisi",
      });
    }

    const result = await Fixture.aggregate([
      // Ambil pertandingan pada musim yang dipilih
      {
        $match: {
          season: season,
          status: "finished",
        },
      },

      // Pecah goals
      {
        $unwind: "$goals",
      },

      // Assist yang null tidak dihitung
      {
        $match: {
          "goals.assist": {
            $ne: null,
          },
        },
      },

      // Kelompokkan berdasarkan pemain assist
      {
        $group: {
          _id: "$goals.assist",
          assists: {
            $sum: 1,
          },
        },
      },

      // Assist terbanyak di atas
      {
        $sort: {
          assists: -1,
        },
      },

      // Ambil data pemain
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

      // Ambil klub pemain
      {
        $lookup: {
          from: "clubs",
          localField: "player.club",
          foreignField: "_id",
          as: "club",
        },
      },
      // {
      //   $lookup: {
      //     from: "clubs",
      //     localField: "player.club",
      //     foreignField: "_id",
      //     as: "club",
      // },

      {
        $unwind: "$club",
      },

      {
        $project: {
          _id: 0,

          player: {
            _id: "$player._id",
            name_player: "$player.name_player",
            photo: "$player.photo",
            position: "$player.position",
          },

          club: {
            _id: "$club._id",
            name_club: "$club.name_club",
            logo: "$club.logo",
          },

          assists: 1,
        },
      },
    ]);

    return res.status(200).json({
      season,
      data: result,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Gagal mengambil Top Assist",
      error: error.message,
    });
  }
};

module.exports = {
  getTopScorers,
  getTopAssists,
};
