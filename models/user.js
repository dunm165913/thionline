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

userSchema.methods.generateHash = function(pass){
    return bcrypt.hashSync(pass,bcrypt.genSaltSync(8),null);
};
userSchema.methods.validPassword = function(pass){
    return bcrypt.compareSync(pass, this.pass);
};
module.exports = mongoose.model('user',userSchema); 