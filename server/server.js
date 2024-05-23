require('dotenv').config({path: 'server/.env'})
const express = require('express');
const mongoose = require('mongoose')
const router = require("./routes/routes")
const cors = require("cors")


const PORT = process.env.PORT || 5000;
const URL = process.env.URL

const app = express();
app.use(cors())
app.use(express.json())

// Подключение к БД
mongoose
    .connect(URL)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.log(`DB connection error: ${err}`))
app.listen(PORT, (err) => {
    err ? console.log(err) : console.log(`Listening port ${PORT}`)
})



app.use('/api', router)

