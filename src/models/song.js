const mongoose = require('mongoose')

const songSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    title_romaji: {
        type: String
    },
    title_english: {
        type: String
    },
    artist: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    album: {
        type: String
    },
    album_art: {
        type: Buffer
    },
    link: {
        type: String
    },
    lyrics: {
        type: String
    },
    translation: {
        type: String
    },
    translation_status: {
        type: Boolean
    },
    tags: [{
        tag: {
            type: String
        }
    }]
}, {
    timestamps: true
})

const Song = mongoose.model('Song', songSchema)

module.exports = Song