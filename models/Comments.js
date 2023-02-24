const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let commentSchema = new Schema({
    postID: String,
    username: String,
    message: String,
    code: String,
    upvotes: Number,
    upvoters: [String]
});

module.exports = mongoose.model('comments',commentSchema);