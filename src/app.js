const path = require('path')
const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
require('./db/mongoose')
const hbs = require('hbs')
const Song = require('./models/song')

// Define paths for Express config
const publicDirectoryPath = path.join(__dirname, '../public')
const viewsPath = path.join(__dirname, '../templates/views')  // Absolute path for new views dir
const partialsPath = path.join(__dirname, '../templates/partials')

const app = express()
const port = process.env.PORT || 3000
app.use(express.json())

// Setup handlebars engine and views location
app.set('view engine', 'hbs') // Set handlebars to create dynamic templates
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)

// Setup static directory to serve
app.use(express.static(publicDirectoryPath))



app.post('/songs', async (req, res) => {
    const song = new Song(req.body)

    try {
        await song.save()
        res.status(201).send(song)
    } catch (e) {
        res.status(400).send(e)
    }
})

// Upload album art
const upload = multer({
    limits: {
        fileSize: 2000000   // 2MB
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload a valid image.'))
        }
        cb(undefined, true)
    }
})

app.post('/songs/:id/album_art', upload.single('album_art'), async (req, res) => {
    const _id = req.params.id
    const buffer = await sharp(req.file.buffer).resize(500, 500, { withoutEnlargement: true }).png().toBuffer()
    await Song.findByIdAndUpdate(_id, { album_art: buffer })
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

// Get all songs
app.get('', async (req, res) => {
    // TODO: pagination

    const songs = await Song.find()
    // Convert album art to base64
    songs.forEach((song) => {
        if (song.album_art) {
            song.album_art = Buffer.from(song.album_art).toString('base64')
        }
    })

    res.render('index', { songs })
})


app.get('/about', (req, res) => {
    res.render('about', {
        title: 'About Me',
        name: 'Freya'
    })
})

// Render page for one song
app.get('/songs/:id', async (req, res) => {

    try {
        const _id = req.params.id
        var song = await Song.findById(_id)
        if (song.album_art) {
            song.album_art = Buffer.from(song.album_art).toString('base64')
        }
        res.render('song', { song })

    } catch (e) {
        res.render('404', {
            errorMessage: 'Song not found.'
        })
    }
})

app.get('*', (req, res) => {
    res.render('404', {
        errorMessage: 'Page not found.'
    })
})

app.listen(port, () => {
    console.log('Server is up on port 3000.')
})