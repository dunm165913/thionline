var mongoose = require('mongoose');
var questionSchema = new mongoose.Schema({
    question: {
        type: String
    },
    correct_answer: {
        type: String
    },
    answer: {
        type: Array
    },
    level: {
        type: String
    },
});
module.exports = mongoose.model('orders', questionSchema);