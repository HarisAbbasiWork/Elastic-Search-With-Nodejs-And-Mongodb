var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var user = new Schema({
    "userName": {
        type: String,
        required: true
    },
    "gender": String,
    "email": String,
    "password": String

});
module.exports = mongoose.model('users', user);