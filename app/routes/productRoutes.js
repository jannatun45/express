const router = require('express').Router()
const multer = require('multer')
const os =require('os')

const productController = require("../controllers/productController");

router.get('/product', productController.get)
router.post('/product', multer({dest: os.tmpdir()}).single("image"), productController.post)
router.put('/product/:id', multer({dest: os.tmpdir()}).single("image"), productController.update)
router.delete('/product/:id', multer({dest: os.tmpdir()}).single("image"), productController.deleteProduct)

module.exports = router;