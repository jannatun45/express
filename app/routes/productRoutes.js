const router = require('express').Router()
const multer = require('multer')
const os =require('os')

const productController = require("../controllers/productController");

router.post('product', multer({dest: os.tmpdir()}).single("image"), productController.post)

module.exports = router;