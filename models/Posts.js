const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let postSchema = new Schema({
    email: String,
    title: String,
    message: String,
    code: String
    /*etc*/
});

module.exports = mongoose.model('posts',postSchema);