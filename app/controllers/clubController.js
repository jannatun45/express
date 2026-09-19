const path = require("path");
const fs = require("fs");
const config = require("../config");
const Club = require("../models/clubModel");

// CREATE A NEW club
const createClub = async (req, res, next) => {
  try {
    // Mengambil data dari request body
    const payload = req.body;

    // Mengecek apakah user mengupload file
    if (req.file) {
      // Lokasi file sementara yang dibuat oleh Multer
      const tmp_path = req.file.path;

      // Mengambil extension dari file asli
      // Contoh: "gambar.png" -> ".png"
      const originalExt = path.extname(req.file.originalname);

      // req.file.filename sudah diberikan oleh Multer
      // originalExt sudah memiliki ".", jadi jangan tambahkan "." lagi
      // Hasil: "5b6b0cac1ea971582af994c57cbf2edd.png"
      const filename = req.file.filename + originalExt;

      // Menentukan folder tujuan penyimpanan gambar
      const target_dir = path.resolve(config.rootPath, "public/images/clubs");
      Club;

      // Membuat folder jika belum ada
      // Jika folder sudah ada, tidak akan membuat folder baru
      fs.mkdirSync(target_dir, { recursive: true });

      // Menentukan lokasi lengkap file gambar
      const target_path = path.join(target_dir, filename);

      // Membuka file sementara untuk dibaca
      const src = fs.createReadStream(tmp_path);

      // Membuat file baru di folder clubs
      const dest = fs.createWriteStream(target_path);

      // Menyalin file sementara ke folder clubs
      src.pipe(dest);

      // Menangani error ketika membaca file
      src.on("error", (error) => {
        next(error);
      });

      // Menangani error ketika menulis file
      dest.on("error", (error) => {
        next(error);
      });

      // Event "finish" berarti file sudah selesai ditulis
      dest.on("finish", async () => {
        try {
          // Membuat document club
          const club = new Club({
            ...payload,
            image_url: filename,
          });

          // Menyimpan club ke MongoDB
          await club.save();

          // Mengirim hasil club ke client
          return res.json(club);
        } catch (error) {
          // Jika penyimpanan database gagal,
          // hapus file gambar yang sudah terlanjur dibuat
          if (fs.existsSync(target_path)) {
            fs.unlinkSync(target_path);
          }

          // Menangani error validasi Mongoose
          if (error.name === "ValidationError") {
            return res.json({
              error: 1,
              message: error.message,
              fields: error.errors,
            });
          }

          // Lempar error ke Express error handler
          next(error);
        }
      });
    } else {
      // Jika tidak ada gambar yang diupload,
      // langsung membuat club dari payload
      const club = new Club(payload);

      // Menyimpan club ke MongoDB
      await club.save();

      // Mengirim club ke client
      return res.json(club);
    }
  } catch (error) {
    console.log("ERROR =>", error);

    // Menangani error validasi Mongoose
    if (error.name === "ValidationError") {
      return res.json({
        error: 1,
        message: error.message,
        fields: error.errors,
      });
    }

    // Lempar error ke Express error handler
    next(error);
  }
};

// GET ALL CLUBS
const getClubs = async (req, res, next) => {
  try {
    // Mengambil semua data club dari MongoDB
    const clubs = await Club.find();

    // Mengirim data clubs ke client
    return res.json(clubs);
  } catch (error) {
    // Menampilkan error ke console
    console.log("ERROR =>", error);

    // Lempar error ke Express error handler
    next(error);
  }
};

// GET ONE CLUB
const getClub = async (req, res, next) => {
  try {
    // Mengambil id club dari URL
    const { id } = req.params;

    // Mencari satu club berdasarkan _id MongoDB
    const club = await Club.findById(id);

    // Jika club tidak ditemukan
    if (!club) {
      return res.status(404).json({
        error: 1,
        message: "Club tidak ditemukan",
      });
    }

    // Mengirim club ke client
    return res.json(club);
  } catch (error) {
    // Menampilkan error ke console
    console.log("ERROR =>", error);

    // Lempar error ke Express error handler
    next(error);
  }
};

// UPDATE CLUB
const updateClub = async (req, res, next) => {
  try {
    // Mengambil id club dari URL
    const { id } = req.params;

    // Mengambil data yang dikirim dari request body
    const payload = req.body;

    // Mencari club berdasarkan id
    const club = await Club.findById(id);

    // Jika club tidak ditemukan
    if (!club) {
      return res.status(404).json({
        error: 1,
        message: "Club tidak ditemukan",
      });
    }

    // Mengecek apakah user mengupload logo baru
    if (req.file) {
      // Lokasi file sementara dari Multer
      const tmp_path = req.file.path;

      // Mengambil extension file asli
      const originalExt = path.extname(req.file.originalname);

      // Membuat nama file baru
      const filename = req.file.filename + originalExt;

      // Menentukan folder tujuan
      const target_dir = path.resolve(config.rootPath, "public/images/clubs");

      // Membuat folder jika belum ada
      fs.mkdirSync(target_dir, { recursive: true });

      // Menentukan lokasi file baru
      const target_path = path.join(target_dir, filename);

      // Membaca file sementara
      const src = fs.createReadStream(tmp_path);

      // Membuat file logo baru
      const dest = fs.createWriteStream(target_path);

      // Menyalin file
      src.pipe(dest);

      // Menangani error membaca file
      src.on("error", (error) => {
        next(error);
      });

      // Menangani error menulis file
      dest.on("error", (error) => {
        next(error);
      });

      // Menunggu file selesai disimpan
      dest.on("finish", async () => {
        try {
          // Menghapus logo lama jika ada
          if (club.logo) {
            const old_logo_path = path.resolve(
              config.rootPath,
              "public/images/clubs",
              club.logo,
            );

            if (fs.existsSync(old_logo_path)) {
              fs.unlinkSync(old_logo_path);
            }
          }

          // Update data club
          Object.assign(club, payload);

          // Mengganti logo dengan logo baru
          club.logo = filename;

          // Menyimpan perubahan ke MongoDB
          await club.save();

          // Mengirim data club terbaru
          return res.json(club);
        } catch (error) {
          // Jika update database gagal,
          // hapus logo baru
          if (fs.existsSync(target_path)) {
            fs.unlinkSync(target_path);
          }

          // Lempar error
          next(error);
        }
      });
    } else {
      // Jika tidak ada logo baru
      // hanya update data yang dikirim
      Object.assign(club, payload);

      // Menyimpan perubahan ke MongoDB
      await club.save();

      // Mengirim club terbaru
      return res.json(club);
    }
  } catch (error) {
    // Menampilkan error
    console.log("ERROR =>", error);

    // Menangani validation error
    if (error.name === "ValidationError") {
      return res.json({
        error: 1,
        message: error.message,
        fields: error.errors,
      });
    }

    // Lempar error ke Express error handler
    next(error);
  }
};

// DELETE CLUB
const deleteClub = async (req, res, next) => {
  try {
    // Mengambil id club dari URL
    const { id } = req.params;

    // Mencari club berdasarkan id
    const club = await Club.findById(id);

    // Jika club tidak ditemukan
    if (!club) {
      return res.status(404).json({
        error: 1,
        message: "Club tidak ditemukan",
      });
    }

    // Jika club memiliki logo
    if (club.logo) {
      // Menentukan lokasi file logo
      const logo_path = path.resolve(
        config.rootPath,
        "public/images/clubs",
        club.logo,
      );

      // Mengecek apakah file logo benar-benar ada
      if (fs.existsSync(logo_path)) {
        // Menghapus file logo
        fs.unlinkSync(logo_path);
      }
    }

    // Menghapus club dari MongoDB
    await Club.findByIdAndDelete(id);

    // Mengirim response berhasil
    return res.json({
      error: 0,
      message: "Club berhasil dihapus",
    });
  } catch (error) {
    // Menampilkan error
    console.log("ERROR =>", error);

    // Lempar error ke Express error handler
    next(error);
  }
};

// Export controller
module.exports = {
  createClub,
  getClubs,
  getClub,
  updateClub,
  deleteClub,
};
