const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
    name: {
        type:String,
        minlength: [3, 'Panjang nama makanan minimal 3 karakter'],
        required: [true, 'nama makanan harus diisi']
    },
    description: {
        type: String,
        maxlength: [1000, 'Panjang nama makanan maximal 1000 karakter']

    },
    price:{
        type: Number,
        default: 0
    },
    image_url: String
}, {timestamps: true})


module.exports= mongoose.model('Product', productSchema)