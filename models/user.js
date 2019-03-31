var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var userSchema = mongoose.Schema({

    email:{
       type:String,
    },
    pass:{
        type: String
    },
    name:{
        type :String
    },
    time:{
        type:Date
    },
    avata:{
        type :String
    }

});


module.exports = mongoose.model('user',userSchema); 