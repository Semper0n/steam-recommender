const express = require('express');
const mongoose = require('mongoose')
const App = require('./models/app')
const BlackListApp = require('./models/blackListApp')

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
        let isInBlackList = BlackListApp.exists({appid: key.appid}) // Не проверено
        if (!isInBlackList) {
            const app = new App(key)
            let isTrue = await App.exists({appid: app.appid})
            if (isTrue) {
                console.log(`Приложение с appid ${app.appid} уже существует`)
            } else {
                app.save()
            }
        } else {
            console.log(`Приложение с appid ${app.appid} находится в чёрном списке`)
        }

    }
}

async function insertAppToBlackList(key) {
        const app = new BlackListApp({appid: key.appid, name: key.name})
            app.save()
}

app.get('/getappslist', (req, res) => {

    // Парсинг списка приложений Steam

    // fetch("https://api.steampowered.com/ISteamApps/GetAppList/v2/")
    //     .then(response => {
    //         if (response.ok) {
    //             return response.text();
    //         } else {
    //             throw new Error('HTTP status ' + response.status);
    //         }
    //     })
    //     .then(data => {
    //         let parsedAppsList = JSON.parse(data.toString())
    //         parsedAppsList = parsedAppsList.applist.apps
    //         let parsedAppsList10 = parsedAppsList //slice(0, 100) // временная фигня
    //         res.json(parsedAppsList10)
    //         insertAppToDB(parsedAppsList10)
    //         console.log('Done writing')
    //     })
    //     .catch(error => {
    //         console.error(error);
    //     })

    // Парсинг основных данных о приложениях
    App
        .find()
        //.find({is_free: null})
        .then(apps => {
            if (apps) {
                for (let key of apps.slice(0, 50)) { // .slice(22, 32)
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
                            console.log(key.appid)
                            if (parsedAppInfo.release_date.coming_soon || !parsedAppInfo.short_description) {
                                App.findOneAndDelete({appid: key.appid})
                                    .then(docs => {
                                        console.log("Deleted App:", docs.appid);
                                    })
                                    .catch(err => {
                                        console.log(err)
                                    })}
                            else if (parsedAppInfo.type !== "game") {
                                insertAppToBlackList(key)

                                App.findOneAndDelete({appid: key.appid})
                                    .then(docs => {
                                        console.log("Deleted App and added to blacklist:", docs.appid);
                                    })
                                    .catch(err => {
                                        console.log(err)
                                    })
                            }
                            else if (!parsedAppInfo.is_free) {
                                // upgradedIDs.push(key.appid)
                                App.findOneAndUpdate(
                                    {appid: key.appid},
                                    {
                                        is_free: parsedAppInfo.is_free,
                                        short_description: parsedAppInfo.short_description,
                                        header_image: parsedAppInfo.header_image,
                                        developers: parsedAppInfo.developers,
                                        publishers: parsedAppInfo.publishers,
                                        price_overview: {
                                            discount_percent: parsedAppInfo.price_overview.discount_percent,
                                            initial_formatted: parsedAppInfo.price_overview.initial_formatted,
                                            final_formatted: parsedAppInfo.price_overview.final_formatted
                                        },
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
                                        console.log(`Updated ${result.appid}`)
                                    })
                            } else {
                                // upgradedIDs.push(key.appid)
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
                                        console.log(`Updated with no price ${result.appid}`)
                                    })
                            }

                        })
                        .catch(error => {
                        console.error(error);
                    })
                }
            } else {
                handleError(res, "No apps")
            }
        }).then(() => {
            res.json("Запрос завершён")
    })
})

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