const Router = require('express')
const App = require("../models/app");
const BlackListApp = require("../models/blackListApp");
const router = new Router()

const APIKEY = process.env.APIKEY


// Обработчик ошибок
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

// Получение списка приложений в БД
router.get('/apps', (req, res) => {
    App
        .find({}, {appid: 1, name: 1})
        .sort({title: 1})
        .then((apps) => {
            res
                .status(200)
                .json(apps)
        })
        .catch(() => handleError(res, "Something goes wrong...")
        )
})

// Получение данных приложения по его appid
router.get('/apps/:id', (req, res) => {
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
})

// Парсинг списка приложений с помощью Web Api Steam
router.get('/GetAppsList', (req, res) => {
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
            parsedAppsList = parsedAppsList.applist.apps.slice(100, 110)
            insertAppToDB(parsedAppsList)
            res.json(parsedAppsList)
        })
        .catch(error => {
            console.error(error);
        })
})

// Парсинг данных приложений с помощью Web Api Steam
router.get('/GetAppsData', (req, res) => {
    App
        .find() //.find({is_free: null})
        .then(apps => {
            if (apps) {
                apps = apps.slice(83380, 95000)
                let index = 83380;
                let interval = setInterval(() => {
                    if (apps.length > 0) {
                        const key = apps.shift();
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
                                }
                                else if (parsedAppInfo.release_date.coming_soon || !parsedAppInfo.short_description) {
                                    App.findOneAndDelete({appid: key.appid})
                                        .then(docs => {
                                            console.log("Deleted App:", docs.appid);
                                        })
                                        .catch(err => {
                                            console.log(err)
                                        })
                                } else if (!parsedAppInfo.is_free) {
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
                                            },
                                            supported_languages: parsedAppInfo.supported_languages
                                        })
                                        .exec()
                                        .then((result) => {
                                            console.log(`Updated`, result.appid)
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
                                            },
                                            supported_languages: parsedAppInfo.supported_languages
                                        }, {new: true})
                                        .exec()
                                        .then((result) => {
                                            console.log(`Updated with no price`, result.appid)
                                        })
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
})

router.get('/GetUserInfo/:steamid', async (req, res) => {
    try {
        let apiUrl = `https://api.steampowered.com`;

        let urls = [
            `${apiUrl}/ISteamUser/GetPlayerSummaries/v2/?key=${APIKEY}&steamids=${req.params.steamid}`,
            `${apiUrl}/IPlayerService/GetOwnedGames/v0001/?key=${APIKEY}&steamid=${req.params.steamid}&format=json`
        ];

        let responses = await Promise.all(urls.map(url => fetch(url).then(res => {
            if (!res.ok) {
                throw new Error(`HTTP status ${res.status}`);
            }
            return res.json();
        })));

        let [userData, gamesData] = responses;

        if (!userData.response.players[0]) {
            return res.status(404).json({message: "Provided SteamID is invalid."});
        }

        const appsList = []
        const appsIds = []

        await Promise.all(gamesData.response.games.map(async (app, index) => {
            const data = await App.findOne({appid: app.appid});
            if (data && data.is_free !== null && data.tags.length !== 0) {
                appsList.push(data)
                appsIds.push(data.appid)
            }
            if (data && data.is_free !== null) {
                app.name = data.name;
                app.image = data.header_image
            } else {
                gamesData.response.games.splice(index, 1);
                gamesData.response.game_count--
                //console.log('=====ERROR=====');
            }
        }));

        const result = await getRecommendations(analyzePreferences(appsList), appsIds)

        return res.json({
            userInfo: userData.response.players[0],
            gamesData: gamesData.response,
            userRecommendations: result
        });

    } catch (error) {
        console.error(error);
        return res.status(400).json({message: "Provided SteamID is invalid."});
    }
});

router.get('/CheckUser/:steamid', async (req, res) => {
    let userData = await fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${APIKEY}&steamids=${req.params.steamid}`)
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP status ${res.status}`);
            }
            return res.json();
        })
    if (!userData.response.players[0]) {
        return res.status(404).json({message: "Provided SteamID is invalid."});
    }
    return res.json(userData.response.players[0]);
})

/*router.get('/getuserdata/:userid', async (req, res) => {
    try {
        const response = await fetch(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${APIKEY}&steamid=${req.params.userid}&format=json`);
        if (!response.ok) {
            throw new Error('HTTP status ' + response.status);
        }

        const appsList = []
        const appsIds = []
        const userGamesData = await response.json();
        await Promise.all(userGamesData.response.games.map(async (app, index) => {
            const data = await App.findOne({ appid: app.appid });
            if (data && data.is_free !== null && data.tags.length !== 0) {
                appsList.push(data)
                appsIds.push(data.appid)
            }
        }));
        const preferences = analyzePreferences(appsList)
        const result = await getRecommendations(preferences, appsIds)
        res.json(result);
    } catch (error) {
        console.error(error);
    }
});*/

function analyzePreferences(games) {
    const genreCounts = {};
    const tagCounts = {};

    games.forEach(game => {
        game.genres.forEach(genre => {
            genre = genre.description
            if (genreCounts[genre]) {
                genreCounts[genre]++;
            } else {
                genreCounts[genre] = 1;
            }
        });

        game.tags.forEach(tag => {
            tag = tag.description
            if (tagCounts[tag]) {
                tagCounts[tag]++;
            } else {
                tagCounts[tag] = 1;
            }
        });
    });

    return {genreCounts, tagCounts};
}

async function getRecommendations(preferences, IDs) {
    const {genreCounts, tagCounts} = preferences;
    let recommendations = [];

    const allGames = await App.find({is_free: {$ne: null}, tags: {$exists: true, $not: {$size: 0}}, appid: {$nin: IDs}}) // {is_free: {$ne: null},tags: {$exists: true, $not: {$size: 0}}}, {appid: 1, name: 1, genres: 1, tags: 1}
    allGames.forEach(game => {
        let genreScore = game.genres.reduce((acc, genre) => acc + (genreCounts[genre.description] || 0), 0);
        let tagScore = game.tags.reduce((acc, tag) => acc + (tagCounts[tag.description] || 0), 0);

        let totalScore = genreScore * 0.7 + tagScore * 0.3;

        if (totalScore > 0) {
            recommendations.push({game, score: totalScore});
        }
    });

    recommendations.sort((a, b) => b.score - a.score);

    return recommendations.slice(0, 20);
}

/*router.get('/getuserinfo/:appid', async (req, res) => {
    try {
        let apiUrl = `https://api.steampowered.com`;

        // Для удобства несколько URL-адресов для API запросов
        let urls = [
                `${apiUrl}/ISteamUser/GetPlayerSummaries/v2/?key=${APIKEY}&steamids=${req.params.appid}`,
            `${apiUrl}/IPlayerService/GetOwnedGames/v0001/?key=${APIKEY}&steamid=${req.params.appid}&format=json`
    ];

        // Параллельные запросы данных
        let responses = await Promise.all(urls.map(url => fetch(url).then(res => {
            if (!res.ok) {
                throw new Error(`HTTP status ${res.status}`);  // Если статус не ОК, бросаем ошибку
            }
            return res.json();  // всегда возвращаем данные в формате JSON
        })));

        // Деструктуризация результатов
        let [playerData, gamesData] = responses;

        // Проверка валидности данных игрока
        if (!playerData.response.players[0]) {
            return res.status(404).json({ message: "Provided SteamID is invalid." });
        }

        await Promise.all(gamesData.response.games.map(async (app, index) => {
            const data = await App.findOne({ appid: app.appid });
            if (data && data.is_free !== null) {
                app.name = data.name;
                app.image = data.header_image
            } else {
                //handleError(res, "Wrong id")
                gamesData.response.games.splice(index, 1);
                gamesData.response.game_count--
                //console.log('=====ERROR=====');
            }
        }));

        // Теперь можно отправить объединенные данные участника и игры в одном ответе
        return res.json({
            userInfo: playerData.response.players[0],
            gamesData: gamesData.response
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred while fetching data." });
    }
});*/

module.exports = router