const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let accountSchema = new Schema({
    email: String,
    password: String
    /*etc*/
});

module.exports = mongoose.model('accounts',accountSchema);