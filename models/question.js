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
    create_at:{
        type:Date
    },
    subject:{
        type:String
    },
    class:{
        type:String
    }
});
module.exports = mongoose.model('questions', questionSchema);