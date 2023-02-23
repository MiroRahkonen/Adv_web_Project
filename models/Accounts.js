const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let accountSchema = new Schema({
    username: String,
    email: String,
    password: String
    /*etc*/
});

module.exports = mongoose.model('accounts',accountSchema);