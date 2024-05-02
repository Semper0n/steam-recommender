const express = require('express');
const mongoose = require('mongoose')
const App = require('./models/app')
const {log} = require("yarn/lib/cli");


const PORT = 3000;
const URL = 'mongodb://0.0.0.0:27017/steam_recommender'


const app = express();

// Подключение к БД
mongoose
    .connect(URL)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.log(`DB connection error: ${err}`))
app.listen(PORT, (err) => {
    err ? console.log(err) : console.log(`Listening port ${PORT}`)
})

// Обработчик ошибок
const handleError = (res, error) => {
    res.status(500).json({error})
}

// Вывод списка приложений в БД
app.get('/apps', (req, res) => {
    App
        .find() // cursor - hasNext, next, forEach
        .sort({title: 1})
        .then((apps) => {
            res
                .status(200)
                .json(apps)
        })
        .catch(() => handleError(res, "Something goes wrong...")
        )
})

// Вывод определённого приложения в БД
app.get('/apps/:id', (req, res) => {
    App
        .find({appid: Number(req.params.id)})
        .then((doc) => {
            if (doc) {
                res
                    .status(200)
                    .json(doc)
            } else {
                handleError(res, "Wrong id")
            }

        })
        .catch(() => handleError(res, "Something goes wrong...")
        )
})

async function insertAppToDB(list) {
    for (let key of list) {
        const app = new App(key)
        let isTrue = await App.exists({appid: app.appid})
        if (isTrue) {
            console.log(`Приложение с appid ${app.appid} уже существует`)
        } else {
            app.save()
        }
    }
}

// Парсинг списка приложений Steam
app.get('/getappslist', (req, res) => {
    fetch("https://api.steampowered.com/ISteamApps/GetAppList/v2/")
        .then(response => {
            if (response.ok) {
                return response.text();
            } else {
                throw new Error('HTTP status ' + response.status);
            }
        })
        .then(data => {
            // let parsedAppsList = JSON.parse(data.toString())
            // parsedAppsList = parsedAppsList.applist.apps
            // let parsedAppsList10 = parsedAppsList.slice(0, 100) // временная фигня
            // res.json(parsedAppsList10)
            // insertAppToDB(parsedAppsList10)
            // console.log('Done writing')
        })
        .catch(error => {
            console.error(error);
        })

    // Парсинг основных данных о приложениях
    App
        .find()
        .then(apps => {
            if (apps) {
                for (let key of apps.slice(0, 1)) {
                    fetch(`https://store.steampowered.com/api/appdetails?appids=${key.appid}`)
                        .then(response => {
                            if (response.ok) {
                                return response.text();
                            } else {
                                throw new Error('HTTP status ' + response.status);
                            }
                        })
                        .then(data => {
                            let parsedAppInfo = JSON.parse(data.toString())
                            parsedAppInfo = parsedAppInfo[`${key.appid}`].data
                            // console.log(parsedAppInfo.platforms.linux)
                            if (parsedAppInfo.price_overview) {
                                App.findOneAndUpdate(
                                    {appid: key.appid},
                                    {
                                        is_free: parsedAppInfo.is_free,
                                        short_description: parsedAppInfo.short_description,
                                        header_image: parsedAppInfo.header_image,
                                        developers: parsedAppInfo.developers,
                                        publishers: parsedAppInfo.publishers,
                                        price: parsedAppInfo.price_overview.final_formatted,
                                        platforms: {
                                            windows: parsedAppInfo.platforms.windows,
                                            mac: parsedAppInfo.platforms.mac,
                                            linux: parsedAppInfo.platforms.linux
                                        },
                                        categories: parsedAppInfo.categories,
                                        genres: parsedAppInfo.genres,
                                        movie: parsedAppInfo.movies[0].webm[480],
                                        release_date: {
                                            coming_soon: parsedAppInfo.release_date.coming_soon,
                                            date: parsedAppInfo.release_date.date
                                        }
                                    })
                                    .exec()
                                    .then((result) => {
                                        console.log('Updated with no price')
                                        res.json(result)
                                    })
                            } else {
                                App.findOneAndUpdate(
                                    {appid: key.appid},
                                    {
                                        is_free: parsedAppInfo.is_free,
                                        short_description: parsedAppInfo.short_description,
                                        header_image: parsedAppInfo.header_image,
                                        developers: parsedAppInfo.developers,
                                        publishers: parsedAppInfo.publishers,
                                        platforms: {
                                            windows: parsedAppInfo.platforms.windows,
                                            mac: parsedAppInfo.platforms.mac,
                                            linux: parsedAppInfo.platforms.linux
                                        },
                                        categories: parsedAppInfo.categories,
                                        genres: parsedAppInfo.genres,
                                        movie: parsedAppInfo.movies[0].webm[480],
                                        release_date: {
                                            coming_soon: parsedAppInfo.release_date.coming_soon,
                                            date: parsedAppInfo.release_date.date
                                        }
                                    }, {new: true})
                                    .exec()
                                    .then((result) => {
                                        console.log('Updated with no price')
                                        res.json(result)
                                    })
                            }

                        })
                }
            } else {
                handleError(res, "No apps")
            }
        })
})


// fetch("https://store.steampowered.com/api/appdetails?appids=976010")
//     .then(response => {
//         if (response.ok) {
//             return response.text();
//         } else {
//             throw new Error('HTTP status ' + response.status);
//         }
//     })
//     .then(data => {
//         let appInfo = JSON.parse(data.toString())
//         console.log(appInfo['976010'].success)
//     })
//     .catch(error => {
//         console.error(error);
//     });


// fetch("https://store.steampowered.com/tag/browse/#global_492")
//     .then(response => {
//         if (response.ok) {
//             return response.text();
//         } else {
//             throw new Error('HTTP status ' + response.status);
//         }
//     })
//     .then(data => {
//         let htmlContent = data
//         let tagRegex = new RegExp("tagid=\"\\d+\">([a-zA-Z0-9\\s'\\./_&amp;-]+)</div>", "g");
//         let matches;
//         while((matches = tagRegex.exec(htmlContent)) !== null)
//         {
//             console.log(matches[1]);
//         }
//         // console.log(data);
//     })
//     .catch(error => {
//         console.error(error);
//     });