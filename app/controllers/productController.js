const path = require("path");
const fs = require("fs");
const config = require("../config");
const Product = require("../models/productModel");

// CREATE A NEW PRODUCT
const post = async (req, res, next) => {
  try {
    // Mengambil data dari request body
    const payload = req.body;

    console.log("ini payload =>", payload);

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
      const target_dir = path.resolve(
        config.rootPath,
        "public/images/products"
      );

      // Membuat folder jika belum ada
      // Jika folder sudah ada, tidak akan membuat folder baru
      fs.mkdirSync(target_dir, { recursive: true });

      // Menentukan lokasi lengkap file gambar
      const target_path = path.join(target_dir, filename);

      // Membuka file sementara untuk dibaca
      const src = fs.createReadStream(tmp_path);

      // Membuat file baru di folder products
      const dest = fs.createWriteStream(target_path);

      // Menyalin file sementara ke folder products
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
          // Membuat document Product
          const product = new Product({
            ...payload,
            image_url: filename,
          });

          // Menyimpan product ke MongoDB
          await product.save();

          // Mengirim hasil product ke client
          return res.json(product);
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
      // langsung membuat product dari payload
      const product = new Product(payload);

      // Menyimpan product ke MongoDB
      await product.save();

      // Mengirim product ke client
      return res.json(product);
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

const get = async(req,res,next)=>{
    try {
        let product = await Product.find()
        return res.json(product)
    } catch (err) {
        
    }
}

// UPDATE A PRODUCT
const update = async (req, res, next) => {
  try {
    // Ambil ID product dari parameter URL
    const { id } = req.params;

    // Ambil data yang dikirim dari client
    const payload = req.body;

    // Cari product berdasarkan ID
    const product = await Product.findById(id);

    // Jika product tidak ditemukan
    if (!product) {
      return res.status(404).json({
        error: 1,
        message: "Product tidak ditemukan",
      });
    }

    // Update data product
    product.name = payload.name;
    product.description = payload.description;
    product.price = payload.price;

    // Cek apakah ada gambar baru
    if (req.file) {
      // Simpan lokasi gambar lama
      const oldImage = product.image_url;

      // Ambil extension gambar baru
      const originalExt = path.extname(req.file.originalname);

      // Buat nama file baru
      const filename = req.file.filename + originalExt;

      // Tentukan folder penyimpanan gambar
      const targetDir = path.resolve(
        config.rootPath,
        "public/images/products"
      );

      // Buat folder jika belum tersedia
      fs.mkdirSync(targetDir, { recursive: true });

      // Tentukan lokasi gambar baru
      const targetPath = path.join(targetDir, filename);

      // Ambil lokasi file sementara dari Multer
      const tmpPath = req.file.path;

      // Pindahkan file sementara ke folder products
      const src = fs.createReadStream(tmpPath);
      const dest = fs.createWriteStream(targetPath);

      src.pipe(dest);

      // Tangani error saat membaca file
      src.on("error", (error) => {
        next(error);
      });

      // Tangani error saat menulis file
      dest.on("error", (error) => {
        next(error);
      });

      // Lanjut setelah gambar selesai disimpan
      dest.on("finish", async () => {
        try {
          // Update nama file gambar
          product.image_url = filename;

          // Simpan perubahan ke MongoDB
          await product.save();

          // Hapus gambar lama jika ada
          if (oldImage) {
            const oldImagePath = path.join(targetDir, oldImage);

            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
            }
          }

          // Hapus file sementara Multer
          if (fs.existsSync(tmpPath)) {
            fs.unlinkSync(tmpPath);
          }

          // Kirim product yang sudah diperbarui
          return res.json(product);
        } catch (error) {
          // Hapus gambar baru jika database gagal
          if (fs.existsSync(targetPath)) {
            fs.unlinkSync(targetPath);
          }

          // Tangani error validasi Mongoose
          if (error.name === "ValidationError") {
            return res.json({
              error: 1,
              message: error.message,
              fields: error.errors,
            });
          }

          next(error);
        }
      });
    } else {
      // Simpan perubahan tanpa mengganti gambar
      await product.save();

      // Kirim product yang sudah diperbarui
      return res.json(product);
    }
  } catch (error) {
    // Tampilkan error untuk debugging
    console.log("ERROR =>", error);

    // Tangani error validasi Mongoose
    if (error.name === "ValidationError") {
      return res.json({
        error: 1,
        message: error.message,
        fields: error.errors,
      });
    }

    next(error);
  }
};

// DELETE PRODUCT
const deleteProduct = async (req, res, next) => {
  try {
    // Ambil ID product dari URL
    const { id } = req.params;

    // Cari product yang akan dihapus
    const product = await Product.findById(id);

    // Pastikan product tersedia
    if (!product) {
      return res.status(404).json({
        error: 1,
        message: "Product tidak ditemukan",
      });
    }

    // Hapus product dari MongoDB
    await Product.findByIdAndDelete(id);

    // Jika product memiliki gambar, hapus file gambarnya
    if (product.image_url) {
      const imagePath = path.resolve(
        config.rootPath,
        "public/images/products",
        product.image_url
      );

      // Hapus gambar jika file masih tersedia
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Kirim response berhasil
    return res.json({
      error: 0,
      message: "Product berhasil dihapus",
    });
  } catch (error) {
    // Teruskan error ke Express error handler
    next(error);
  }
};

// Export controller
module.exports = {
  post,
  get,
  update,
  deleteProduct
};