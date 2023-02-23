const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let postSchema = new Schema({
    username: String,
    email: String,
    title: String,
    message: String,
    code: String
});

module.exports = mongoose.model('posts',postSchema);