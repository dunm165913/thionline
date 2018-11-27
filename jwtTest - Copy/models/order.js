var mongoose = require('mongoose');
var orderSchema = new mongoose.Schema({
    id_buy: {
        type: String
    },
    id_product: {
        type: String
    },
    id_owner: {
        type: String
    },
    time: {
        type: Object
    },
    address: {
        type: String
    },
    name_product: {
        type: String
    },
    price: {
        type: Number
    },
    vanchuyen: {
        type: String
    },
    thanhtoan: {
        type: String
    },
    state: {
        type: String
    },
    tel: {
        type: Number
    },
    soluong: {
        type: Number
    },
    note: {
        type: String
    },
    email_buy:{
        type:String
    },
    cancel:{
        type:Number
    },
    rate:{
        type:Number
    }
});
module.exports = mongoose.model('orders', orderSchema);