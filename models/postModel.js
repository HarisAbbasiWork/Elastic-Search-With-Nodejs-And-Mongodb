var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var post = new Schema({
    "title": String,
    "description": String

},{
    timestamps:true
});
module.exports = mongoose.model('posts', post);