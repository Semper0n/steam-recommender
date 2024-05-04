const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const blackListAppSchema = new Schema({
    appid: {
        type: Number,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    }
})

const BlackListApp = mongoose.model('BlackListApp', blackListAppSchema)

module.exports = BlackListApp