var mongoose = require('mongoose');
var examSchema = mongoose.Schema({
    time_start: {
        type: Date
    },
    time_finish: {
        type: Date
    },
    code_confirm: {
        type: String
    },
    questions: {
        type: Array
    },
    student: {
        type: Array
    },
    answers: {
        type: Array
    }, 
    correct_answer: {
        type: Array
    }
});
module.exports = mongoose.model('exams', examSchema);