var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var secret = 'SECRET';

var UserSchema = new mongoose.Schema({
    username: {type: String, lowercase: true, unique: true},
    firstName: String,
    lastName: String,
    affiliate: String,
    hash: String,
    salt: String
});



UserSchema.methods.setPassword = function(password){
    this.salt = crypto.randomBytes(16).toString('hex');
    
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

UserSchema.methods.validPassword = function(password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
    
    return this.hash === hash;
};

UserSchema.methods.generateJWT = function() {
    var today = new Date();
    var exp = new Date(today);
    exp.setDate(today.getDate() + 60);
    
    return jwt.sign({
        _id: this._id,
        username: this.username,
        firstName: this.firstName,
        lastName: this.lastName,
        exp: parseInt(exp.getTime() / 1000, 10),
    }, secret);
};

mongoose.model('User', UserSchema);