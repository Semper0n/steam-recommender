const App = require("../models/app");
const BlackListApp = require("../models/blackListApp");

class AppsController {

    getAppsListInDB(req, res) {
        App
            .find({}, {appid: 1, name: 1, _id: 0})
            .sort({title: 1})
            .then((apps) => {
                res
                    .status(200)
                    .json(apps)
            })
            .catch(() => handleError(res, "Something goes wrong...")
            )
    }

    getAppInDB(req, res) {
        App
            .find({appid: Number(req.params.id)})
            .then((data) => {
                if (data) {
                    res
                        .status(200)
                        .json(data)
                } else {
                    handleError(res, "Wrong id")
                }

            })
            .catch(() => handleError(res, "Something goes wrong...")
            )
    }

    parseAppsList(req, res) {
        fetch("https://api.steampowered.com/ISteamApps/GetAppList/v2/")
            .then(response => {
                if (response.ok) {
                    return response.text();
                } else {
                    throw new Error('HTTP status ' + response.status);
                }
            })
            .then(data => {
                let parsedAppsList = JSON.parse(data.toString())
                parsedAppsList = parsedAppsList.applist.apps
                insertAppToDB(parsedAppsList)
                res.json(parsedAppsList)
            })
            .catch(error => {
                console.error(error);
            })
    }

    parseAppsData(req, res) {
        App
            .find().lean() //.find()
            .then(apps => {
                if (apps) {
                    //apps = apps.slice(16140)
                    let index = 16140;
                    let interval = setInterval(() => {
                        if (apps.length > 0) {
                            const key = apps.shift();
                            let yearRegex = /\b\d{4}\b/;
                            fetch(`https://store.steampowered.com/api/appdetails?appids=${key.appid}&l=russian`)
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
                                    console.log(`appid:${key.appid} (iteration: ${index})`)
                                    if (parsedAppInfo.type !== "game") {
                                        insertAppToBlackList(key)

                                        App.findOneAndDelete({appid: key.appid})
                                            .then(docs => {
                                                console.log("Deleted App and added to blacklist:", docs.appid);
                                            })
                                            .catch(err => {
                                                console.log(err)
                                            })
                                    } else if (parsedAppInfo.release_date.coming_soon || !parsedAppInfo.short_description) {
                                        App.findOneAndDelete({appid: key.appid})
                                            .then(docs => {
                                                console.log("Deleted App:", docs.appid);
                                            })
                                            .catch(err => {
                                                console.log(err)
                                            })
                                    } else {
                                        let match = parsedAppInfo.release_date?.date.match(yearRegex);
                                        const updateFields = {
                                            is_free: parsedAppInfo.is_free,
                                            short_description: parsedAppInfo.short_description,
                                            header_image: parsedAppInfo.header_image,
                                            developers: parsedAppInfo.developers,
                                            publishers: parsedAppInfo.publishers,
                                            platforms: {
                                                windows: parsedAppInfo.platforms?.windows,
                                                mac: parsedAppInfo.platforms?.mac,
                                                linux: parsedAppInfo.platforms?.linux
                                            },
                                            categories: parsedAppInfo.categories,
                                            genres: parsedAppInfo.genres,
                                            movie: parsedAppInfo.movies && parsedAppInfo.movies.length > 0 ? parsedAppInfo.movies[0].webm[480] : null,
                                            release_date: {
                                                coming_soon: parsedAppInfo.release_date?.coming_soon,
                                                date: parsedAppInfo.release_date?.date,
                                                year: match[0]
                                            },
                                            supported_languages: parsedAppInfo.supported_languages
                                        }
                                        if (!parsedAppInfo.is_free) {
                                            updateFields.price_overview = {
                                                discount_percent: parsedAppInfo.price_overview.discount_percent,
                                                initial_formatted: parsedAppInfo.price_overview.initial_formatted,
                                                final_formatted: parsedAppInfo.price_overview.final_formatted
                                            }
                                        }
                                        App.findOneAndUpdate(
                                            {appid: key.appid},
                                            updateFields,
                                            {new: true, upsert: true}
                                        )
                                            .exec()
                                            .then((result) => {
                                                console.log(`Updated`, result.appid);
                                            })
                                            .catch((err) => {
                                                console.error(err);
                                            });
                                    }

                                })
                                .catch(error => {
                                    console.error(error);
                                })

                            fetch(`https://store.steampowered.com/app/${key.appid}/?l=russian`)
                                .then(response => {
                                    if (response.ok) {
                                        return response.text();
                                    } else {
                                        throw new Error('HTTP status ' + response.status);
                                    }
                                })
                                .then(data => {
                                    let tagRegex = new RegExp("class=\"app_tag\" style.*?>([а-яА-ЯёЁa-zA-Z0-9\\s'./_&amp;-]+)</a>"
                                        , "g");
                                    let matches;
                                    let index = 1
                                    let arr = []
                                    while ((matches = tagRegex.exec(data)) !== null) {
                                        arr.push({description: matches[1].replace(/\r?\n?\t?/g, "")})
                                        index++
                                    }
                                    App.findOneAndUpdate(
                                        {appid: key.appid},
                                        {tags: arr},
                                        {new: true}
                                    )
                                        .exec()

                                    // console.log(`Добавлены теги: ${arr}`)
                                })
                                .catch(error => {
                                    console.error(error);
                                });
                            fetch(`https://store.steampowered.com/appreviews/${key.appid}?json=1&language=all&purchase_type=all&l=russian`)
                                .then(response => {
                                    if (response.ok) {
                                        return response.text();
                                    } else {
                                        throw new Error('HTTP status ' + response.status);
                                    }
                                })
                                .then(data => {
                                    let parsedAppRating = JSON.parse(data.toString())
                                    parsedAppRating = parsedAppRating.query_summary
                                    App.findOneAndUpdate(
                                        {appid: key.appid},
                                        {
                                            rating: {
                                                review_score: parsedAppRating.review_score,
                                                review_score_desc: parsedAppRating.review_score_desc,
                                                total_positive: parsedAppRating.total_positive,
                                                total_negative: parsedAppRating.total_negative,
                                                total_reviews: parsedAppRating.total_reviews
                                            }
                                        },
                                        {new: true}
                                    )
                                        .exec()

                                })
                                .catch(error => {
                                    console.error(error);
                                });
                            index++

                        } else {
                            clearInterval(interval)
                            res.json("Запрос завершён")
                        }
                    }, 1500)


                } else {
                    handleError(res, "No apps")
                }
            })
    }

    // async getAppsYear(req, res) {
    //     let allGames = await App.find(
    //         {"release_date.date": {$exists: true, $ne: ''}}, {appid: 1, _id: 0, release_date: 1}
    //     ).lean()
    //     // allGames= allGames.slice(0, 100)
    //     let yearRegex = /\b\d{4}\b/;
    //     allGames.forEach(game => {
    //         let match = game.release_date.date.match(yearRegex);
    //         if (match) {
    //             App.findOneAndUpdate({appid: game.appid}, {
    //                 $set: { "release_date.year": match[0] }
    //             }).exec()
    //         }
    //     })
    //     res.json(allGames)
    // }
}

const handleError = (res, error) => {
    res.status(500).json({error})
}

async function insertAppToDB(list) {
    for (let key of list) {
        let isInBlackList = await BlackListApp.exists({appid: key.appid})                     // Не проверено
        if (!isInBlackList) {
            const app = new App(key)
            let isTrue = await App.exists({appid: app.appid})
            if (isTrue) {
                console.log(`Приложение с appid ${app.appid} уже существует`)
            } else {
                app.save()
            }
        } else {
            console.log(`Приложение с appid ${key.appid} находится в чёрном списке`)
        }

    }
}

async function insertAppToBlackList(key) {
    const app = new BlackListApp({appid: key.appid, name: key.name})
    app.save()
}

module.exports = new AppsController()