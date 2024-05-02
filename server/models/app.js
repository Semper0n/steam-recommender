const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const appSchema = new Schema({
    appid: {
        type: Number,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
})

const App = mongoose.model('App', appSchema)

module.exports = App