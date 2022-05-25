const mongoose=require('mongoose')

const productSchema= new mongoose.Schema({
    custID:String,
    name:String,
    image:String,
    price:Number,
    brand:String,
    catogary:String,
    specification:String
})

module.exports=mongoose.model("products", productSchema)