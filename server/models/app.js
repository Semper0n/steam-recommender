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
    is_free: Boolean,
    short_description: String,
    header_image: String,
    developers: [String],
    publishers: [String],
    price_overview: {
        discount_percent: Number,
        initial_formatted: String,
        final_formatted: String
    },
    platforms: {
        windows: Boolean,
        mac: Boolean,
        linux: Boolean
    },
    categories: [
        {
        id: Number,
        description: String
        }
    ],
    genres: [
        {
            id: String,
            description: String
        }
    ],
    movie: String,
    release_date: {
        coming_soon: Boolean,
        date: String
    },
    supported_languages: String,
    tags: [
        {
        description: String
        }
    ],
    rating: {
        review_score: Number,
        review_score_desc: String,
        total_positive: Number,
        total_negative: Number,
        total_reviews: Number
    }
})

const App = mongoose.model('App', appSchema)

module.exports = App


