const express = require("express");

const playerController = require("../controllers/playerController");
const multer = require("multer");
const os = require("os");
const router = express.Router();
const upload = multer({
  dest: os.tmpdir(),
});

// Tambah pemain
router.post("/players", upload.single("photo"), playerController.createPlayer);

// Semua pemain + pencarian + filter + pagination
router.get("/players", playerController.getPlayers);

// Transfer pemain ke klub lain
// router.patch("/players/:id/transfer", transferPlayer);

router.get("/players/club/:clubId", playerController.getPlayersByClub);
router.get("/players/:id", playerController.getPlayerById);
router.put("/players/:id", playerController.updatePlayer);
router.delete("/players/:id", playerController.deletePlayer);

module.exports = router;
