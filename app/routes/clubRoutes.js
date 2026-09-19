const router = require("express").Router();
const multer = require("multer");
const os = require("os");

const clubController = require("../controllers/clubController");

router.post(
  "/club",
  multer({ dest: os.tmpdir() }).single("image"),
  clubController.createClub,
);

// GET ALL CLUBS
// GET /club
// Mengambil semua club
router.get("/club", clubController.getClubs);

// GET ONE CLUB
// GET /club/:id
// Mengambil satu club berdasarkan id
router.get("/club/:id", clubController.getClub);

// UPDATE CLUB
// PUT /club/:id
// Mengubah data club berdasarkan id
router.put(
  "/club/:id",
  multer({ dest: os.tmpdir() }).single("logo"),
  clubController.updateClub,
);

// DELETE CLUB
// DELETE /club/:id
// Menghapus club berdasarkan id
router.delete("/club/:id", clubController.deleteClub);
module.exports = router;
