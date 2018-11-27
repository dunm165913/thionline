var mongoose = require('mongoose');
var productSchema = mongoose.Schema({
    name: {
        type: String
    },
    price: {
        type: Number
    },
    img: {
        type:Array
    },
    brand: {
        type: String
    },
    time_creat: {
        type: Date
    },
    categories: {
        type: Number
    },
    imgavata:{
        type:String
    },
    described: {
        type: String
    },
    id_owner: {
        type: String
    },
    state: {
        type: Number
    },
    like: {
        type: Array
    },
    dislike:{
        type:Array
    },
    comment:{
        type:Array
    },
    rate:{
        type:Array
    },
    id:{
        type:Number
    },
    report:{
        type:Array
    }


});
module.exports = mongoose.model('products', productSchema);